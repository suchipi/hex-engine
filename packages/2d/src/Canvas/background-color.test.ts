/// <reference types="@test-it/core/globals" />
import { createRoot, useNewComponent } from "@hex-engine/core";
import Inspector from "@hex-engine/inspector";
import Canvas from "./index";

it("canvas background color", async () => {
  const rootEnt = createRoot(() => {
    useNewComponent(() => Canvas({ backgroundColor: "#006400" }));
  });
  const inspector = rootEnt.getComponent(Inspector)!;
  inspector.hide();

  expect(await TestIt.captureScreenshot()).toMatchImageSnapshot();
});
