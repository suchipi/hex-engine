import fs from "fs";
import path from "path";
import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
// @ts-ignore
import ForkTsCheckerWebpackPlugin from "react-dev-utils/ForkTsCheckerWebpackPlugin";
// @ts-ignore
import resolve from "resolve";
// @ts-ignore
import typescriptFormatter from "react-dev-utils/typescriptFormatter";

const packageDir = (...parts: Array<string>) =>
  path.resolve(__dirname, "..", ...parts);
const localDir = (...parts: Array<string>) =>
  path.resolve(process.cwd(), ...parts);

const htmlWebpackPluginOptions: { [key: string]: any } = {
  title: process.env.HEX_ENGINE_GAME_NAME || "hex-engine game",
};

if (fs.existsSync(localDir("src/index.html"))) {
  htmlWebpackPluginOptions.template = localDir("src/index.html");
}

export default (mode: "production" | "development" | "test") => {
  return {
    context: localDir(),
    devtool: mode === "development" ? "eval-source-map" : undefined,

    mode: mode === "test" ? "development" : mode,

    entry: [packageDir("./src/polyfills"), localDir("./src/index.ts")],
    output: {
      path: localDir("dist"),
    },

    resolve: {
      mainFields: ["browser", "main"],
      extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx", ".json"],
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
      mode === "test" ? null : new HtmlWebpackPlugin(htmlWebpackPluginOptions),

      mode === "test"
        ? null
        : new ForkTsCheckerWebpackPlugin({
            typescript: resolve.sync("typescript", {
              basedir: localDir(),
            }),
            async: mode === "development",
            useTypescriptIncrementalApi: true,
            checkSyntacticErrors: true,
            tsconfig: fs.existsSync(localDir("tsconfig.json"))
              ? localDir("tsconfig.json")
              : packageDir("tsconfig.json"),
            reportFiles: [
              "**",
              "!**/__tests__/**",
              "!**/?(*.)(spec|test).*",
              "!**/src/setupTests.*",
            ],
            silent: false,

            // The formatter is invoked directly in react-dev-utils/WebpackDevServerUtils during development
            formatter: mode === "production" ? typescriptFormatter : undefined,
          }),
    ].filter(Boolean),
    performance: {
      hints: false
    },
    optimization: {
      usedExports: true,
    },
  };
};
