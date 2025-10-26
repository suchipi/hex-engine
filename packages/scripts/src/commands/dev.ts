import chalk from "chalk";
import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import makeWebpackConfig from "../makeWebpackConfig";

export default async function dev(options: {
  lib?: string;
  port?: number;
  title?: string;
}) {
  process.env.BABEL_ENV = "development";
  process.env.NODE_ENV = "development";

  const port = options.port || 8080;

  const webpackConfig = options.lib
    ? makeWebpackConfig({
        mode: "development",
        srcFile: "lib",
        outDir: "lib",
        library: options.lib,
        title: options.title,
      })
    : makeWebpackConfig({
        mode: "development",
        srcFile: "index",
        outDir: "dist",
        title: options.title,
      });

  // Create a webpack compiler that is configured with custom messages.
  const compiler = webpack(webpackConfig);
  const devServer = new WebpackDevServer(
    {
      compress: true,
      client: {
        logging: "none",
        overlay: true,
      },
      hot: true,
      historyApiFallback: {
        // Paths with dots should still use the history fallback.
        // See https://github.com/facebook/create-react-app/issues/387.
        disableDotRule: true,
      },
      port,
    },
    compiler
  );

  console.log(chalk.cyan("Starting the development server...\n"));
  await devServer.start();

  return new Promise<void>((resolve, reject) => {
    process.on("SIGINT", () => {
      devServer.stop().then(resolve, reject);
    });

    process.on("SIGTERM", () => {
      devServer.stop().then(resolve, reject);
    });
  });
}
