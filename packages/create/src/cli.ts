#!/usr/bin/env node

import path from "path";
import kleur from "kleur";
import run from "./index";

async function main() {
  const usage = `Usage:

create-hex-engine-game <dir>

  Creates a new hex-engine game in the specified directory.
`;

  const dir = process.argv[2];

  if (!dir || dir === "--help") {
    console.error(usage);
    process.exitCode = 1;
    return;
  }

  await run(path.resolve(process.cwd(), dir));
}

main().catch((err) => {
  console.error(kleur.red(err && err.stack ? err.stack : err));
  process.exitCode = 1;
});
