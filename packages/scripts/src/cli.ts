#!/usr/bin/env node
import "./polyfills";

import chalk from "chalk";
import yargsParser from "yargs-parser";
import run from "./index";

async function main() {
  const usage = `Usage:

hex-engine-scripts build

  Compiles 'src/index.ts' (or 'src/index.js') into the 'dist' folder, creating
  a production build suitable for uploading to static site hosting.

  Options:
    --lib: Compiles your code as a library instead of a standalone game.

      Compiles your code as a library instead of a standalone game. This will
      make the following changes:
      - Compilation will start from 'src/lib.ts' (or 'src/lib.js') instead of
        'src/index.ts' (or 'src/index.js').
      - Build output will be written to the 'lib' folder instead of the 'dist'
        folder.
      - No 'index.html' file will be present in the build output.
      - The output bundle will be wrapped in a UMD wrapper.

      Provide a string that will be used as the library name in the UMD
      wrapper; that library name will be used as a global variable if there's
      no CommonJS or AMD module loader present when the code is run.

      Example: hex-engine-scripts build --lib myGame
      Example: hex-engine-scripts build --lib myVeryCoolGame

    --title: The title to use in the generated index.html page.

      Example: hex-engine-scripts build --title "My Game"

hex-engine-scripts dev

  Runs a local http dev server serving the compilation output 'src/index.ts'
  (or 'src/index.js'). When files change, compilation will re-run
  automatically.

  Options:
    --port: The port to run the http server on. If unspecified, defaults to 8080.

      If the chosen port is unavailable, the program will ask to run on an
      alternative port.

      Example: hex-engine-scripts dev --port 1234

    --lib: Serves 'src/lib.ts' (or .js) instead of 'src/index.ts' (or .js).

      See the "--lib" option under 'hex-engine-scripts build' for more info.

      Example: hex-engine-scripts dev --lib myGame
      Example: hex-engine-scripts dev --lib myVeryCoolGame

    --title: The title to use in the generated index.html page.

      Example: hex-engine-scripts dev --title "My Game"

hex-engine-scripts test

  Runs tests using https://github.com/suchipi/test-it.

  Options:
    --watch: Runs interactively, watch files on disk, and re-run tests on when files change.
    --update-snapshots, -u: Updates test snapshots.

  Run 'hex-engine-scripts test --help' for more info.
`;

  const argv = yargsParser(process.argv.slice(2), {
    boolean: ["help", "watch", "u", "update-snapshots", "updateSnapshots"],
    string: ["lib", "title", "test-update-files", "testUpdateFiles"],
    number: ["port"],
  });

  const command = argv._ && argv._[0];

  if (argv.lib === "") {
    argv.lib = "hexEngineGame";
  }

  if (
    !command ||
    (argv.help && command !== "test") ||
    (command !== "build" && command !== "dev" && command !== "test")
  ) {
    console.error(usage);
    process.exitCode = 1;
    return;
  }

  await run(command, argv);
}

main().catch((err) => {
  console.error(chalk.red(err && err.stack ? err.stack : err));
  process.exitCode = 1;
});
