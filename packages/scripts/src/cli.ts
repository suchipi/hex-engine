#!/usr/bin/env node
import "./polyfills";

import chalk from "chalk";
import run from "./index";

async function main() {
  const usage = `Usage:

hex-engine-scripts build

  Creates a production build in the 'dist' folder, suitable for uploading to static site hosting.

hex-engine-scripts dev

	Runs a local development server hosting the game on port 8080.

hex-engine-scripts test

  Runs tests using https://github.com/suchipi/test-it. Use --watch for interactive mode.
`;

  const command = process.argv[2];

  if (
    !command ||
    (command !== "build" && command !== "dev" && command !== "test")
  ) {
    console.error(usage);
    process.exitCode = 1;
    return;
  }

  await run(command);
}

main().catch((err) => {
  console.error(chalk.red(err && err.stack ? err.stack : err));
  process.exitCode = 1;
});
