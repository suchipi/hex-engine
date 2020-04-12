/// <reference types="@test-it/core/globals" />
import {
  createRoot,
  useNewComponent,
  Canvas,
  Ogmo,
  useChild,
  useDraw,
} from "@hex-engine/2d";
import Inspector from "@hex-engine/inspector";
import project from "./project.ogmo";
import level from "./level.json";

it("renders correctly", async () => {
  const rootEnt = createRoot(() => {
    const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
    canvas.fullscreen();

    const ogmo = useNewComponent(() =>
      Ogmo.Project(project, {
        entity_1: (data) =>
          useChild(() => {
            useDraw((context) => {
              context.translate(data.x, data.y);
              context.translate(-data.originX, -data.originY);

              if (data.rotation) {
                context.rotate(data.rotation);
              }

              context.fillStyle = "red";
              context.fillRect(0, 0, data.width, data.height);
            });
          }),
      })
    );

    ogmo.useLevel(level);
  });
  const inspector = rootEnt.getComponent(Inspector)!;
  inspector.hide();

  expect(await TestIt.captureScreenshot()).toMatchImageSnapshot({
    threshold: 0.2,
  });
});
