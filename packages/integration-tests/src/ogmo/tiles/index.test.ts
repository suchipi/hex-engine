/// <reference types="@test-it/core/globals" />
import {
  createRoot,
  useNewComponent,
  Canvas,
  Ogmo,
  useChild,
  useRawDraw,
} from "@hex-engine/2d";
import Inspector from "@hex-engine/inspector";
import project from "./project.ogmo";
import level from "./level.json";

it("renders correctly", async () => {
  const rootEnt = createRoot(() => {
    const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
    canvas.fullscreen();

    const ogmo = useNewComponent(() => Ogmo.Project(project));

    useChild(() => {
      useRawDraw((context) => {
        // Ogmo levels used to be rendered as if their origin was at the top-left, but as of 0.8.x, they are now rendered
        // as if their origin is at the center of the level. To make the level actually visible, we need to shift it into the viewport.
        //
        // This 64,64 comes from the size of the level (128x128) divided by 2.
        context.translate(64, 64);
      });

      ogmo.useLevel(level);
    });
  });
  const inspector = rootEnt.getComponent(Inspector)!;
  inspector.hide();

  expect(await TestIt.captureScreenshot()).toMatchImageSnapshot();
});
