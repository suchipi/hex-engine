import chalk from "chalk";
import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import clearConsole from "react-dev-utils/clearConsole";
import {
  choosePort,
  createCompiler,
  prepareUrls,
} from "react-dev-utils/WebpackDevServerUtils";
import makeWebpackConfig from "../makeWebpackConfig";

export default async function dev(options: {
  lib?: string;
  port?: number;
  title?: string;
}) {
  process.env.BABEL_ENV = "development";
  process.env.NODE_ENV = "development";

  const isInteractive = process.stdout.isTTY;

  const port = await choosePort("localhost", options.port || 8080);
  if (!port) return;

  const urls = prepareUrls("http", "localhost", port);

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

  const devSocket = {
    warnings: (warnings: any): any =>
      // @ts-ignore
      devServer.sockWrite(devServer.sockets, "warnings", warnings),
    errors: (errors: any): any =>
      // @ts-ignore
      devServer.sockWrite(devServer.sockets, "errors", errors),
  };

  // Create a webpack compiler that is configured with custom messages.
  // @ts-ignore
  const compiler = createCompiler({
    appName: options.title || "hex-engine game",
    // @ts-ignore
    config: webpackConfig,
    devSocket,
    urls,
    useYarn: true,
    useTypeScript: true,
    tscCompileOnError: false,
    webpack,
  });

  const devServer = new WebpackDevServer(compiler, {
    compress: true,
    clientLogLevel: "none",
    hot: true,
    publicPath: "/",
    quiet: true,
    overlay: true,

    historyApiFallback: {
      // Paths with dots should still use the history fallback.
      // See https://github.com/facebook/create-react-app/issues/387.
      disableDotRule: true,
    },
  });

  return new Promise((resolve, reject) => {
    devServer.listen(port, (err) => {
      if (err) {
        reject(err);
      }

      if (isInteractive) {
        clearConsole();
      }

      console.log(chalk.cyan("Starting the development server...\n"));

      process.on("SIGINT", () => {
        devServer.close();
        resolve();
      });

      process.on("SIGTERM", () => {
        devServer.close();
        resolve();
      });
    });
  });
}
