#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const prettier = require("prettier");
const kleur = require("kleur");
const yargsParser = require("yargs-parser");

function mutateJsonFile(path, cb) {
  console.log(`Updating '${path}'...`);

  const str = fs.readFileSync(path);
  const json = JSON.parse(str);
  cb(json);
  const newStr = prettier.format(JSON.stringify(json), {
    filepath: path,
  });
  fs.writeFileSync(path, newStr);
}

const rootDir = (...parts) => path.resolve(__dirname, "..", ...parts);

async function cli({ version }) {
  mutateJsonFile(rootDir("packages/2d/package.json"), (pkg) => {
    pkg.version = version;
    pkg.dependencies["@hex-engine/core"] = version;
    pkg.dependencies["@hex-engine/inspector"] = version;
  });

  mutateJsonFile(rootDir("packages/core/package.json"), (pkg) => {
    pkg.version = version;
  });

  mutateJsonFile(rootDir("packages/create/package.json"), (pkg) => {
    pkg.version = version;
  });

  mutateJsonFile(rootDir("packages/game/package.json"), (pkg) => {
    pkg.dependencies["@hex-engine/2d"] = version;
    pkg.devDependencies["hex-engine-scripts"] = version;
  });

  mutateJsonFile(rootDir("packages/inspector/package.json"), (pkg) => {
    pkg.version = version;
    pkg.dependencies["@hex-engine/core"] = version;
  });

  mutateJsonFile(rootDir("packages/integration-tests/package.json"), (pkg) => {
    pkg.dependencies["@hex-engine/2d"] = version;
    pkg.dependencies["@hex-engine/core"] = version;
    pkg.dependencies["@hex-engine/inspector"] = version;
  });

  mutateJsonFile(rootDir("packages/scripts/package.json"), (pkg) => {
    pkg.version = version;
    pkg.peerDependencies["@hex-engine/2d"] = version;
  });

  mutateJsonFile(rootDir("packages/scripts/package.json"), (pkg) => {
    pkg.version = version;
    pkg.peerDependencies["@hex-engine/2d"] = version;
  });

  mutateJsonFile(rootDir("packages/create/versions.json"), (versions) => {
    versions.hex = version;
    versions.typescript = JSON.parse(
      fs.readFileSync(rootDir("node_modules", "typescript", "package.json"))
    ).version;
  });
}

async function main() {
  const argv = yargsParser(process.argv.slice(2));
  if (!argv._ || !argv._[0]) {
    throw new Error(
      "Please specify version as first positional argument to the script"
    );
  }

  const options = {
    version: argv._[0],
  };

  await cli(options);
}

main().catch((err) => {
  process.exitCode = 1;
  console.error(kleur.red(err.stack));
});
