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
  useUpdate,
  RunLoop,
} from "@hex-engine/2d";

test("update callbacks run before draw callbacks", () => {
  const calls: Array<string> = [];

  function BlueCircle() {
    useType(BlueCircle);
    const radius = 10;
    const origin = new Vector(-9, -7);

    const geom = useNewComponent(() =>
      Geometry({
        shape: new Circle(radius),
        position: new Vector(50, 100),
        rotation: Math.PI / 4,
        origin,
      })
    );

    const pointRadius = 1;
    const centerPoint = new Circle(pointRadius);

    useDraw((context) => {
      calls.push("draw");

      context.fillStyle = "blue";
      geom.shape.draw(context, "fill");

      context.strokeStyle = "black";
      context.strokeRect(0, 0, 10, 10);

      context.translate(
        radius - pointRadius + origin.x,
        radius - pointRadius + origin.y
      );
      context.fillStyle = "black";
      centerPoint.draw(context, "fill");
    });

    const ROTATION_SPEED = 5;
    useUpdate((delta) => {
      calls.push("update");

      geom.rotation += ROTATION_SPEED / delta;
    });
  }

  function Root() {
    useType(Root);

    const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
    canvas.setPixelated(true);
    canvas.fullscreen();

    useChild(BlueCircle);
  }

  const root = createRoot(Root);
  const runLoopApi = root.getComponent(RunLoop)!;
  runLoopApi.pause();
  runLoopApi.step();

  expect(calls).toEqual(["update", "draw"]);
});
