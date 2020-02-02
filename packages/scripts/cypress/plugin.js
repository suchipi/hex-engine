// @ts-ignore
const webpack = require("@cypress/webpack-preprocessor");
const makeWebpackConfig = require("../dist/makeWebpackConfig").default;
const {
  addMatchImageSnapshotPlugin,
} = require("cypress-image-snapshot/plugin");

exports.setupPlugin = function setupPlugin(on, config) {
  addMatchImageSnapshotPlugin(on, config);

  const webpackConfig = makeWebpackConfig("test");

  on(
    "file:preprocessor",
    webpack({
      webpackOptions: webpackConfig,
      watchOptions: {},
    })
  );
};
