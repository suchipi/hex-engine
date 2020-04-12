/// <reference types="@test-it/core/globals" />
import {
  createRoot,
  useNewComponent,
  Canvas,
  Ogmo,
  useChild,
  Label,
  useDraw,
  Entity,
} from "@hex-engine/2d";
import useBitmapFont from "../../useBitmapFont";
import Inspector from "@hex-engine/inspector";
import project from "./project.ogmo";
import level from "./level.json";

let rootEnt: Entity;
beforeEach(() => {
  if (rootEnt) {
    rootEnt.destroy();
  }
  document.body.innerHTML = "";
});

it("renders correctly", async () => {
  rootEnt = createRoot(() => {
    const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
    canvas.fullscreen();

    const ogmo = useNewComponent(() => Ogmo.Project(project, {}));
    ogmo.useLevel(level);
  });
  const inspector = rootEnt.getComponent(Inspector)!;
  inspector.hide();

  expect(await TestIt.captureScreenshot()).toMatchImageSnapshot({
    threshold: 0.2,
  });
});

it("renders correctly - custom decals", async () => {
  rootEnt = createRoot(() => {
    const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
    canvas.fullscreen();

    const ogmo = useNewComponent(() =>
      Ogmo.Project(project, {}, (decalData) =>
        useChild(() => {
          const font = useBitmapFont();
          const label = useNewComponent(() => Label({ font }));

          useDraw((context) => {
            label.text = JSON.stringify(decalData);
            label.draw(context, { x: decalData.x, y: decalData.y });
          });
        })
      )
    );

    ogmo.useLevel(level);
  });
  const inspector = rootEnt.getComponent(Inspector)!;
  inspector.hide();

  expect(await TestIt.captureScreenshot()).toMatchImageSnapshot();
});
