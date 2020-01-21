import {
  useType,
  useNewComponent,
  Geometry,
  Polygon,
  Point,
  Physics,
  useDraw,
} from "@hex-engine/2d";

export default function Floor(position: Point) {
  useType(Floor);

  const geometry = useNewComponent(() =>
    Geometry({
      shape: Polygon.rectangle(new Point(200, 25)),
      position: position.clone(),
    })
  );

  useNewComponent(() => Physics.Body(geometry, { isStatic: true }));

  useDraw((context) => {
    context.fillStyle = "#ddd";
    geometry.shape.draw(context, "fill");
  });
}
