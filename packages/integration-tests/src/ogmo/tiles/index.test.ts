/// <reference types="@test-it/core/globals" />
import { createRoot, useNewComponent, Canvas, Ogmo } from "@hex-engine/2d";
import Inspector from "@hex-engine/inspector";
import project from "./project.ogmo";
import level from "./level.json";

async function screenshotRoot(cb: () => void) {
  const rootEnt = createRoot(() => {
    const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
    canvas.fullscreen();
    cb();
  });
  const inspector = rootEnt.getComponent(Inspector)!;
  inspector.hide();

  expect(await TestIt.captureScreenshot()).toMatchImageSnapshot();
}

it("renders correctly", () =>
  screenshotRoot(() => {
    const ogmo = useNewComponent(() => Ogmo.Project(project));

    ogmo.useLevel(level);
  }));
