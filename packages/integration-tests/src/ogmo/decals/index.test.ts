/// <reference types="@test-it/core/globals" />
import {
  createRoot,
  useNewComponent,
  Canvas,
  Ogmo,
  useChild,
  SystemFont,
  Label,
  useDraw,
  Entity,
} from "@hex-engine/2d";
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

async function screenshotRoot(cb: () => void) {
  rootEnt = createRoot(() => {
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
    const ogmo = useNewComponent(() => Ogmo.Project(project, {}));

    ogmo.useLevel(level);
  }));

it("renders correctly - custom decals", () =>
  screenshotRoot(() => {
    const ogmo = useNewComponent(() =>
      Ogmo.Project(project, {}, (decalData) =>
        useChild(() => {
          const font = useNewComponent(() =>
            SystemFont({ name: "sans-serif", size: 10 })
          );
          const label = useNewComponent(() => Label({ font }));

          useDraw((context) => {
            label.text = JSON.stringify(decalData);
            label.draw(context, { x: decalData.x, y: decalData.y });
          });
        })
      )
    );

    ogmo.useLevel(level);
  }));
