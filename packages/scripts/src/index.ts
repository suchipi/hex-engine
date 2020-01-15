import "./polyfills";
import build from "./commands/build";
import dev from "./commands/dev";

export default function run(command: "build" | "dev") {
  return new Promise((resolve, reject) => {
    process.on("unhandledRejection", reject);

    switch (command) {
      case "build": {
        build().then(resolve);
        break;
      }
      case "dev": {
        dev().then(resolve);
        break;
      }
    }
  });
}
