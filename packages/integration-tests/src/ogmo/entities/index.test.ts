/// <reference types="@test-it/core/globals" />
import {
  createRoot,
  useNewComponent,
  Canvas,
  Ogmo,
  useChild,
  Label,
  useDraw,
} from "@hex-engine/2d";
import Inspector from "@hex-engine/inspector";
import useBitmapFont from "../../useBitmapFont";
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
    const ogmo = useNewComponent(() =>
      Ogmo.Project(project, {
        entity_1: (data) =>
          useChild(() => {
            const font = useBitmapFont();
            const label = useNewComponent(() => Label({ font }));

            useDraw((context) => {
              label.text = JSON.stringify(data);
              label.draw(context, {
                x: 0,
                y: data.y,
              });
            });
          }),
      })
    );

    ogmo.useLevel(level);
  }));
