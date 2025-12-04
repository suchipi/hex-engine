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
  strokeOrFill = "fill",
}: {
  color: string;
  radius: number;
  position?: Vector;
  origin?: Vector;
  rotation?: number;
  strokeOrFill?: "stroke" | "fill";
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
    context.strokeStyle = color;
    context.fillStyle = color;
    geom.shape.draw(context, strokeOrFill);

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

export default function Root() {
  useType(Root);

  const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
  canvas.setPixelated(true);
  canvas.fullscreen();

  /* const green2 = */ useChild(() =>
    CircleThing({
      color: "green",
      radius: 20,
      position: new Vector(50, 100),
      // origin: new Vector(5, 5),
      strokeOrFill: "stroke",
    })
  );

  const green = useChild(() =>
    CircleThing({
      color: "green",
      radius: 20,
      position: new Vector(50, 100),
      origin: new Vector(5, 5),
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
    })
  );

  red.rootComponent.addChild(() =>
    CircleThing({
      color: "pink",
      radius: 10,
      position: new Vector(15, 15),
    })
  );
}

test("child positions relative to parent origin (ignores offset caused by non-center origin)", async () => {
  const rootEnt = createRoot(Root);
  const inspector = rootEnt.getComponent(Inspector)!;
  inspector.hide();

  await Preloader.load();

  expect(await TestIt.captureScreenshot()).toMatchImageSnapshot({
    maxDifferentPixels: 10,
  });
});
