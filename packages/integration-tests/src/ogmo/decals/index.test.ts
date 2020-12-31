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
  Preloader,
  useRawDraw,
  useCallbackAsCurrent,
  Geometry,
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

    // Move level into visible area (since its origin is at the center)
    useRawDraw((context) => {
      context.translate(128, 128);
    });
    ogmo.useLevel(level);
  });
  const inspector = rootEnt.getComponent(Inspector)!;
  inspector.hide();

  await Preloader.load();

  expect(await TestIt.captureScreenshot()).toMatchImageSnapshot({
    maxDifferentPixels: 10,
  });
});

it("renders correctly - custom decals", async () => {
  rootEnt = createRoot(() => {
    const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
    canvas.fullscreen();

    const ogmo = useNewComponent(() =>
      Ogmo.Project(project, {}, (info) =>
        useChild(() => {
          const font = useBitmapFont();
          const label = useNewComponent(() => Label({ font }));

          let loaded = false;
          info.geometryPromise.then(
            useCallbackAsCurrent((result) => {
              loaded = true;
              useNewComponent(() => Geometry(result));
            })
          );

          useDraw((context) => {
            if (!loaded) return;

            label.text = JSON.stringify(info.data);
            label.draw(context);
          });
        })
      )
    );

    // Move level into visible area (since its origin is at the center)
    useRawDraw((context) => {
      context.translate(128, 128);
    });
    ogmo.useLevel(level);
  });
  const inspector = rootEnt.getComponent(Inspector)!;
  inspector.hide();

  await Preloader.load();

  expect(await TestIt.captureScreenshot()).toMatchImageSnapshot();
});
