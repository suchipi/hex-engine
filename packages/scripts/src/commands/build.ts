import chalk from "chalk";
import webpack from "webpack";
import formatWebpackMessages from "react-dev-utils/formatWebpackMessages";
import makeWebpackConfig from "../makeWebpackConfig";

export default async function build(options: { lib?: string; title?: string }) {
  process.env.BABEL_ENV = "production";
  process.env.NODE_ENV = "production";

  console.log("Creating an optimized production build...");

  const webpackConfig = options.lib
    ? makeWebpackConfig({
        mode: "production",
        srcFile: "lib",
        outDir: "lib",
        library: options.lib,
        title: options.title,
      })
    : makeWebpackConfig({
        mode: "production",
        srcFile: "index",
        outDir: "dist",
        title: options.title,
      });

  // @ts-ignore
  const compiler = webpack(webpackConfig);
  return new Promise<void>((resolve, reject) => {
    compiler.run((err: any, stats: any) => {
      let messages;
      if (err) {
        if (!err.message) {
          return reject(err);
        }

        // @ts-ignore
        messages = formatWebpackMessages({
          errors: [err.message],
          warnings: [],
        });
      } else {
        const statsJson = stats.toJson({
          all: false,
          warnings: true,
          errors: true,
        });
        messages = formatWebpackMessages({
          errors: statsJson.errors
            .filter(Boolean)
            .map((message: any) => message.message || String(message)),
          warnings: statsJson.warnings
            .filter(Boolean)
            .map((message: any) => message.message || String(message)),
        });
      }
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        return reject(new Error(messages.errors.join("\n\n")));
      }

      if (
        process.env.CI &&
        (typeof process.env.CI !== "string" ||
          process.env.CI.toLowerCase() !== "false") &&
        messages.warnings.length
      ) {
        console.log(
          chalk.yellow(
            "\nTreating warnings as errors because process.env.CI = true.\n" +
              "Most CI servers set it automatically.\n"
          )
        );
        return reject(new Error(messages.warnings.join("\n\n")));
      }

      console.log(chalk.yellow(messages.warnings.join("\n\n")));

      if (options.lib) {
        console.log(
          "Build complete! The library bundle is in the 'lib' folder."
        );
      } else {
        console.log(
          "Build complete! To deploy your game, upload the contents of the 'dist' folder to a web server."
        );
      }
      resolve();
    });
  });
}
