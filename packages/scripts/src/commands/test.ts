import child_process from "child_process";
// @ts-ignore implicit any
import onExit from "on-exit";

let child: child_process.ChildProcess | null = null;
onExit(() => {
  if (child) {
    child.kill("SIGKILL");
  }
});

export default function test(): Promise<void> {
  process.env.BABEL_ENV = "test";
  process.env.NODE_ENV = "test";

  child = child_process.spawn(
    "node",
    [
      require.resolve("@test-it/cli/dist/cli.js"),
      "--loader",
      require.resolve("../test-it-loader"),
      "--resolver",
      require.resolve("../test-it-resolver"),
      ...process.argv.slice(3),
    ],
    { stdio: "inherit" }
  );

  return new Promise((resolve, reject) => {
    if (!child) return reject(new Error("No child spawned"));

    child.on("error", (err) => {
      child = null;
      reject(err);
    });
    child.on("exit", (code, _signal) => {
      child = null;
      if (code) {
        process.exitCode = code;
      }
      resolve();
    });
  });
}
