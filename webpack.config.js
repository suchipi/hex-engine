const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const rootDir = (...parts) => path.resolve(__dirname, ...parts);

module.exports = {
  entry: [rootDir("./polyfills"), rootDir("./packages/game/src/index.ts")],
  output: {
    path: rootDir("packages/game/dist"),
  },

  resolve: {
    mainFields: ["browser", "main"],
    extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx", ".json"],
  },

  module: {
    rules: [
      {
        test: /\.[tj]sx?$/,
        loader: "babel-loader",
        options: Object.assign(
          {
            babelrc: false,
          },
          require("./babel.config")
        ),
      },
      {
        test: /\.(png|jpe?g|gif|wav|mp3|ogg)$/i,
        use: ["file-loader"],
      },
      {
        test: /\.(ase|aseprite)$/i,
        use: ["aseprite-loader"],
      },
      {
        test: /\.(xml)$/i,
        use: ["xml-source-loader"],
      },
      {
        test: /\.(fnt)$/i,
        use: ["bmfont-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "hex-engine game",
    }),
    new webpack.EnvironmentPlugin({ NODE_ENV: "development" }),
  ],
  optimization: {
    usedExports: true,
  },
};
