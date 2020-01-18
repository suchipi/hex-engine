import {
  useType,
  useNewComponent,
  Geometry,
  Polygon,
  Point,
  useUpdate,
  useDraw,
  Physics,
  useDestroy,
  useEntityName,
  useContext,
  Pointer,
} from "@hex-engine/2d";

export default function Box({ position }: { position: Point }) {
  useType(Box);
  useEntityName("Box");

  const geometry = useNewComponent(() =>
    Geometry({
      shape: Polygon.rectangle(new Point(10, 10)),
      position,
    })
  );

  const physics = useNewComponent(() =>
    Physics.Body(geometry, { respondsToMouseConstraint: true })
  );

  const pointer = useNewComponent(Pointer);

  const { canvas } = useContext();

  useUpdate(() => {
    if (geometry.position.y > canvas.height * 2) {
      useDestroy().destroy();
    }
  });

  useDraw((context) => {
    if (pointer.isPressing) {
      context.lineWidth = 2;
      context.strokeStyle = "red";
    } else if (pointer.isInsideBounds) {
      context.lineWidth = 2;
      context.strokeStyle = "cyan";
    } else {
      context.lineWidth = 1;
      context.strokeStyle = "black";
    }
    geometry.shape.draw(context, "stroke");
  });

  return {
    geometry,
    physics,
  };
}
