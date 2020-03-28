/// <reference types="@test-it/core/globals" />
import { createRoot, useNewComponent } from "@hex-engine/core";
import Canvas from "./index";

it("canvas background color", async () => {
  createRoot(() => {
    useNewComponent(() => Canvas({ backgroundColor: "green" }));
  });

  expect(await TestIt.captureScreenshot()).toMatchImageSnapshot();
});
