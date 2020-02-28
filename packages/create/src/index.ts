import path from "path";
import ora from "ora";
import { cp, cd, exec } from "shelljs";

const spinner = ora();
const templateDir = path.resolve(__dirname, "..", "template");

export default function makeIt(targetDirectory: string) {
  console.log(`Creating a @hex-engine/2d game in '${targetDirectory}'...`);

  cp("-r", templateDir, targetDirectory);
  cd(targetDirectory);

  spinner.start("Installing dependencies ...");

  exec("npm install --save @hex-engine/2d@latest", { silent: true });
  exec("npm install --save-dev hex-engine-scripts@latest", { silent: true });
  exec("npm install --save-dev typescript@latest", { silent: true });

  spinner.succeed('Dependencies installed !');

  console.log("");
  console.log(`All done! To start working on your game, run:

cd "${targetDirectory}"
npm start
`);
}
