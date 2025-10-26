import fs from "fs";
import path from "path";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";

const localDir = (...parts: Array<string>) =>
  path.resolve(process.cwd(), ...parts);

const findSrc = (name: string) => {
  const withExtension = (ext: string) => localDir(`./src/${name}.${ext}`);

  if (fs.existsSync(withExtension("ts"))) {
    return withExtension("ts");
  } else if (fs.existsSync(withExtension("tsx"))) {
    return withExtension("tsx");
  } else if (fs.existsSync(withExtension("jsx"))) {
    return withExtension("jsx");
  } else if (fs.existsSync(withExtension("js"))) {
    return withExtension("js");
  } else {
    throw new Error(
      `Could not find file named either '${name}.ts', '${name}.js', '${name}.tsx', or '${name}.jsx' in '${localDir(
        "src"
      )}'. Please create a file with one of those names.`
    );
  }
};

const makeWebpackConfig = ({
  mode,
  srcFile,
  outDir,
  library,
  title,
}: {
  mode: "production" | "development" | "test";
  srcFile: string;
  outDir: string;
  library?: string;
  title?: string;
}) => {
  const htmlWebpackPluginOptions: { [key: string]: any } = {
    title: title || "hex-engine game",
  };

  if (fs.existsSync(localDir("src/index.html"))) {
    htmlWebpackPluginOptions.template = localDir("src/index.html");
  }

  const output: any = {
    path: localDir(outDir),
  };
  if (library) {
    output.library = library;
    output.libraryTarget = "umd";
  }

  return {
    context: localDir(),
    devtool: mode === "development" ? "eval-source-map" : undefined,

    mode: mode === "test" ? "development" : mode,

    entry: [findSrc(srcFile)],
    output,

    resolve: {
      mainFields: ["browser", "main"],
      extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx", ".json"],
      alias:
        mode === "production"
          ? { "@hex-engine/inspector$": "@hex-engine/inspector/dist/stub" }
          : {},
    },

    module: {
      rules: [
        {
          test: /\.[tj]sx?$/,
          loader: require.resolve("babel-loader"),
          exclude: /node_modules/,
          options: {
            babelrc: false,
            compact: true,
            presets: [
              require("@babel/preset-typescript").default,
              [
                require("@babel/preset-env").default,
                {
                  modules: false,
                },
              ],
              require("@babel/preset-react").default,
            ],
            plugins: [
              require("@babel/plugin-proposal-class-properties").default,
              require("@babel/plugin-proposal-nullish-coalescing-operator")
                .default,
              require("@babel/plugin-proposal-optional-chaining").default,
            ],
          },
        },
        {
          test: /\.(png|jpe?g|gif|wav|mp3|ogg)$/i,
          use: require.resolve("file-loader"),
        },
        {
          test: /\.(ase|aseprite)$/i,
          use: require.resolve("aseprite-loader"),
        },
        {
          test: /\.(xml)$/i,
          use: require.resolve("xml-source-loader"),
        },
        {
          test: /\.(fnt)$/i,
          use: require.resolve("bmfont-loader"),
        },
        {
          test: /\.css$/i,
          use: [require.resolve("style-loader"), require.resolve("css-loader")],
        },
        {
          test: /\.ogmo$/i,
          use: require.resolve("ogmo-project-loader"),
        },
        {
          test: /\.json$/i,
          use: require.resolve("ogmo-level-json-loader"),
          type: "javascript/auto",
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(mode),
      }),
      mode === "test" || (library && mode !== "development")
        ? null
        : new HtmlWebpackPlugin(htmlWebpackPluginOptions),
    ].filter(Boolean),
    performance: {
      hints: false,
    },
    optimization: {
      usedExports: true,
    },
  };
};

export default makeWebpackConfig;
