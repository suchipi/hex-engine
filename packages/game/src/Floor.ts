import {
  useType,
  useNewComponent,
  useDraw,
  Physics,
  Geometry,
  Polygon,
  Point,
  useContext,
} from "@hex-engine/2d";

export default function Floor() {
  useType(Floor);

  const context = useContext();
  const canvasSize = new Point(context.canvas.width, context.canvas.height);
  const rectangleSize = new Point(canvasSize.x, 48);

  const geometry = useNewComponent(() =>
    Geometry({
      shape: Polygon.rectangle(rectangleSize),
      position: canvasSize.subtract(rectangleSize.divide(2)),
    })
  );

  useNewComponent(() => Physics.Body(geometry, { isStatic: true }));

  useDraw((context) => {
    context.fillStyle = "#eee";
    geometry.shape.draw(context, "fill");
  });
}
