import fs from "fs";
import path from "path";
// @ts-ignore implicit any
import defaultLoader from "@test-it/default-loader";

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

export default function loader(filepath: string): string {
  const ext = path.extname(filepath);

  switch (ext) {
    case ".ase":
    case ".aseprite": {
      return runSimpleWebpackLoader(require("aseprite-loader"), filepath);
    }
    case ".xml": {
      return runSimpleWebpackLoader(require("xml-source-loader"), filepath);
    }
    case ".fnt": {
      return runSimpleWebpackLoader(require("bmfont-loader"), filepath);
    }
    default: {
      // Default loader supports js, ts, jsx, tsx, json, css, and behaves like url-loader for everything else.
      return defaultLoader(filepath);
    }
  }
}
