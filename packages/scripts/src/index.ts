import "./polyfills";
import build from "./commands/build";
import dev from "./commands/dev";
import test from "./commands/test";

export default function run(command: "build" | "dev" | "test") {
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
      case "test": {
        test().then(resolve);
        break;
      }
    }
  });
}
