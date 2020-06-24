import "./polyfills";
import build from "./commands/build";
import dev from "./commands/dev";
import test from "./commands/test";

export default function run(
  command: "build" | "dev" | "test",
  options: { [key: string]: any }
) {
  return new Promise((resolve, reject) => {
    process.on("unhandledRejection", reject);

    switch (command) {
      case "build": {
        build(options).then(resolve);
        break;
      }
      case "dev": {
        dev(options).then(resolve);
        break;
      }
      case "test": {
        test().then(resolve);
        break;
      }
    }
  });
}
