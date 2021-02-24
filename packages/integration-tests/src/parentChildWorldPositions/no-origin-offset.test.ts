/// <reference types="@test-it/core/globals" />
import {
  Canvas,
  useNewComponent,
  useChild,
  useType,
  Vector,
  useDraw,
  Geometry,
  Circle,
  createRoot,
  Preloader,
  useCallbackAsCurrent,
} from "@hex-engine/2d";
import Inspector from "@hex-engine/inspector";

function CircleThing({
  color,
  radius,
  position = new Vector(0, 0),
  origin = new Vector(0, 0),
  rotation = 0,
}: {
  color: string;
  radius: number;
  position?: Vector;
  origin?: Vector;
  rotation?: number;
}) {
  useType(CircleThing);

  const geom = useNewComponent(() =>
    Geometry({
      shape: new Circle(radius),
      position,
      rotation,
      origin,
    })
  );

  const pointRadius = 3;
  const centerPoint = new Circle(pointRadius);

  useDraw((context) => {
    context.fillStyle = color;
    geom.shape.draw(context, "fill");

    context.translate(radius - pointRadius, radius - pointRadius);
    context.fillStyle = "black";
    centerPoint.draw(context, "fill");

    context.translate(pointRadius, pointRadius);
    context.strokeStyle = "white";
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(radius, 0);
    context.stroke();
  });

  return {
    addChild: useCallbackAsCurrent(useChild),
  };
}

function Root() {
  useType(Root);

  const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
  canvas.setPixelated(true);
  canvas.fullscreen();

  const green = useChild(() =>
    CircleThing({
      color: "green",
      radius: 20,
      position: new Vector(50, 100),
    })
  );

  green.rootComponent.addChild(() =>
    CircleThing({
      color: "lightgreen",
      radius: 10,
      position: new Vector(15, 15),
    })
  );

  const red = useChild(() =>
    CircleThing({
      color: "red",
      radius: 20,
      position: new Vector(150, 100),
      rotation: Math.PI / 4,
    })
  );

  red.rootComponent.addChild(() =>
    CircleThing({
      color: "pink",
      radius: 10,
      position: new Vector(15, 15),
    })
  );

  const blue = useChild(() =>
    CircleThing({
      color: "blue",
      radius: 20,
      position: new Vector(250, 100),
      rotation: Math.PI / 2,
    })
  );

  blue.rootComponent.addChild(() =>
    CircleThing({
      color: "skyblue",
      radius: 10,
      position: new Vector(15, 15),
    })
  );
}

test("children inherit position and rotation from parents", async () => {
  const rootEnt = createRoot(Root);
  const inspector = rootEnt.getComponent(Inspector)!;
  inspector.hide();

  await Preloader.load();

  expect(await TestIt.captureScreenshot()).toMatchImageSnapshot({
    maxDifferentPixels: 10,
  });
});
