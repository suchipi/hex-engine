import fs from "fs";
import { defaultResolver } from "kame";

const infernoPackagesWithDevModuleField = new Set([
  "inferno",
  "inferno-compat",
  "inferno-hydrate",
  "inferno-clone-vnode",
  "inferno-create-element",
  "inferno-extras",
]);

exports.resolve = function myResolve(source: string, fromFile: string) {
  // Inferno asks that we use non-standard "dev:module" field
  if (
    infernoPackagesWithDevModuleField.has(source) &&
    process.env.NODE_ENV !== "production"
  ) {
    const pkgJsonPath = defaultResolver.resolve(
      `${source}/package.json`,
      fromFile
    );
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
    const devModuleField = pkgJson["dev:module"];
    return defaultResolver.resolve(`${source}/${devModuleField}`, fromFile);
  }

  return defaultResolver.resolve(source, fromFile);
};
