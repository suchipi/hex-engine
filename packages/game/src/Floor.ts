import {
  useType,
  useNewComponent,
  useDraw,
  Physics,
  Geometry,
  Polygon,
  Vector,
  useCanvasSize,
} from "@hex-engine/2d";

export default function Floor() {
  useType(Floor);

  const { canvasSize, onCanvasResize } = useCanvasSize();
  const rectangleSize = new Vector(canvasSize.x * 2, 48);
  const rectanglePosition = canvasSize
    .subtract(rectangleSize.divide(2))
    .add(new Vector(0, 20));

  const geometry = useNewComponent(() =>
    Geometry({
      shape: Polygon.rectangle(rectangleSize),
      position: rectanglePosition,
    })
  );

  useNewComponent(() => Physics.Body(geometry, { isStatic: true }));

  onCanvasResize(() => {
    const rectangleSize = new Vector(canvasSize.x * 2, 48);
    const rectanglePosition = canvasSize
      .subtract(rectangleSize.divide(2))
      .add(new Vector(0, 20));

    geometry.shape.width = rectangleSize.x;
    geometry.shape.height = rectangleSize.y;
    geometry.position.mutateInto(rectanglePosition);
  });

  useDraw((context) => {
    context.fillStyle = "#eee";
    geometry.shape.draw(context, "fill");
  });
}
