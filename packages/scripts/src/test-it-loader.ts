import fs from "fs";
import path from "path";
import * as babel from "@babel/core";
import mime from "mime-types";

// This only supports webpack loaders that are:
// - Synchronous
// - Don't rely on anything from `this` except `resourcePath`
interface SimpleWebpackLoader {
  (this: { resourcePath: string }, source: string | Buffer): string;
  raw?: boolean;
}

function runSimpleWebpackLoader(
  webpackLoader: SimpleWebpackLoader,
  filepath: string
) {
  const ctx = { resourcePath: filepath };

  if (webpackLoader.raw) {
    const source = fs.readFileSync(filepath);
    return webpackLoader.call(ctx, source);
  } else {
    const source = fs.readFileSync(filepath, "utf-8");
    return webpackLoader.call(ctx, source);
  }
}

export function load(filename: string): string {
  const extension = path.extname(filename);

  switch (extension) {
    case ".ase":
    case ".aseprite": {
      return runSimpleWebpackLoader(require("aseprite-loader"), filename);
    }
    case ".xml": {
      return runSimpleWebpackLoader(require("xml-source-loader"), filename);
    }
    case ".fnt": {
      return runSimpleWebpackLoader(require("bmfont-loader"), filename);
    }
    case ".json": {
      return runSimpleWebpackLoader(
        require("ogmo-level-json-loader"),
        filename
      );
    }
    case ".css": {
      // This imitates style-loader
      const content = fs.readFileSync(filename, "utf-8");
      return `
        var style = document.createElement("style");
        style.type = "text/css";
        style.textContent = ${JSON.stringify(content)};
        document.head.appendChild(style);
      `;
    }
    case ".ogmo": {
      return runSimpleWebpackLoader(require("ogmo-project-loader"), filename);
    }
    case ".js":
    case ".jsx":
    case ".mjs":
    case ".ts":
    case ".tsx": {
      let config;
      if (filename.match(/node_modules/)) {
        config = {
          compact: true,
          plugins: ["@babel/plugin-transform-modules-commonjs"],
        };
      } else {
        config = {
          compact: false,
          sourceType: "unambiguous" as "unambiguous",
          presets: [
            [
              "@babel/preset-env",
              {
                modules: false,
                targets: { node: "current" },
              },
            ],
            "@babel/preset-typescript",
            "@babel/preset-react",
          ],
          plugins: [
            "@babel/plugin-proposal-class-properties",
            "@babel/plugin-proposal-nullish-coalescing-operator",
            "@babel/plugin-proposal-optional-chaining",
            "@babel/plugin-transform-modules-commonjs",
          ],
          filename,
        };
      }

      const result = babel.transformFileSync(filename, config);
      return result?.code || "";
    }

    default: {
      // This imitates url-loader, standing in place of file-loader
      const type = mime.lookup(extension) || "application/octet-stream";
      const base64 = fs.readFileSync(filename, "base64");
      const url = `data:${type};base64,${base64}`;
      return `module.exports = ${JSON.stringify(url)}`;
    }
  }
}
