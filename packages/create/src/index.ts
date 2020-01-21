import path from "path";
import { cp, cd, exec } from "shelljs";

const templateDir = path.resolve(__dirname, "..", "template");

export default function makeIt(targetDirectory: string) {
  console.log(`Creating a @hex-engine/2d game in '${targetDirectory}'...`);

  cp("-r", templateDir, targetDirectory);
  cd(targetDirectory);
  exec("npm install --save @hex-engine/2d@latest");
  exec("npm install --save-dev hex-engine-scripts@latest");
  exec("npm install --save-dev typescript@latest");

  console.log(`All done! To start working on your game, run:

cd '${targetDirectory}'
npm start
`);
}
