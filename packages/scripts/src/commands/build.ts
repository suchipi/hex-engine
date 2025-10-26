import kleur from "kleur";
import webpack from "webpack";
import util from "node:util";
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

  const compiler = webpack(webpackConfig)!;
  return new Promise<void>((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err != null) {
        console.error(kleur.red(util.inspect(err)));
        return reject(err);
      }

      const messages = stats!.toJson({
        all: false,
        warnings: true,
        errors: true,
      });

      if (messages.errors && messages.errors.length > 0) {
        for (const error of messages.errors) {
          console.error(kleur.red(util.inspect(error)));
        }
        return reject(new Error("Compilation failed"));
      }

      if (
        process.env.CI &&
        (typeof process.env.CI !== "string" ||
          process.env.CI.toLowerCase() !== "false") &&
        messages.warnings &&
        messages.warnings.length > 0
      ) {
        console.log(
          kleur.yellow(
            "\nTreating warnings as errors because process.env.CI = true.\n" +
              "Most CI servers set it automatically.\n"
          )
        );
        for (const warning of messages.warnings) {
          console.error(kleur.yellow(util.inspect(warning)));
        }
        return reject(new Error("Compilation failed"));
      }

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
