/// <reference types="@test-it/core/globals" />
import { createRoot } from "@hex-engine/2d";
import Inspector from "@hex-engine/inspector";
import Root from "./Root";

test("ogmo level positions load correctly", async () => {
  const rootEnt = createRoot(Root);
  const inspector = rootEnt.getComponent(Inspector)!;
  inspector.hide();

  expect(await TestIt.captureScreenshot()).toMatchImageSnapshot();
});
