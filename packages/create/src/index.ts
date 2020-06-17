import path from "path";
import ora from "ora";
import { cp, cd, exec } from "shelljs";

const spinner = ora();
const templateDir = path.resolve(__dirname, "..", "template");

function execAsync(cmd: string): Promise<unknown> {
  return new Promise((resolve) => {
    exec(cmd, { silent: true }, resolve);
  });
}

export default async function makeIt(targetDirectory: string) {
  console.log(`Creating a @hex-engine/2d game in '${targetDirectory}'...`);

  cp("-r", templateDir, targetDirectory);
  cd(targetDirectory);

  spinner.start("Installing dependencies...");

  await execAsync("npm install --save @hex-engine/2d@latest");
  await execAsync("npm install --save-dev hex-engine-scripts@latest");
  await execAsync("npm install --save-dev typescript@latest");

  spinner.succeed("Dependencies installed!");

  console.log("");
  console.log(`All done! To start working on your game, run:

cd "${targetDirectory}"
npm start
`);
}
