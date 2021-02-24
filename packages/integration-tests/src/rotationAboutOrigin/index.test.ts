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
  Polygon,
  useEntityName,
  createRoot,
  Preloader,
} from "@hex-engine/2d";
import Inspector from "@hex-engine/inspector";

function Root() {
  useType(Root);

  const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
  canvas.setPixelated(true);
  canvas.fullscreen();

  useChild(() => {
    useEntityName("y-line");

    const geom = useNewComponent(() =>
      Geometry({
        shape: Polygon.rectangle(4000, 1),
        position: new Vector(0, 100),
      })
    );

    useDraw((context) => {
      context.fillStyle = "red";
      geom.shape.draw(context, "fill");
    });
  });

  useChild(() => {
    useEntityName("green circle");
    const radius = 10;

    const geom = useNewComponent(() =>
      Geometry({
        shape: new Circle(radius),
        position: new Vector(90, 100),
        rotation: Math.PI / 4,
      })
    );

    const pointRadius = 1;
    const centerPoint = new Circle(pointRadius);

    useDraw((context) => {
      context.fillStyle = "green";
      geom.shape.draw(context, "fill");

      context.strokeStyle = "black";
      context.strokeRect(0, 0, 10, 10);

      context.translate(radius - pointRadius, radius - pointRadius);
      context.fillStyle = "black";
      centerPoint.draw(context, "fill");
    });
  });

  useChild(() => {
    useEntityName("blue circle");
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
  });
}

describe("rotation about origin", () => {
  it("behaves as expected", async () => {
    const rootEnt = createRoot(Root);
    const inspector = rootEnt.getComponent(Inspector)!;
    inspector.hide();

    await Preloader.load();

    expect(await TestIt.captureScreenshot()).toMatchImageSnapshot({
      maxDifferentPixels: 10,
    });
  });
});
