import { useType } from "@hex-engine/core";
import { Angle, Circle, Point, Polygon } from "../Models";
import { useInspectorHoverOutline } from "../Hooks";

function Geometry({
  shape = new Polygon([new Point(0, 0)]),
  position = new Point(0, 0),
  rotation = new Angle(0),
  scale = new Point(1, 1),
}: {
  shape?: Polygon | Circle | undefined;
  position?: Point | undefined;
  rotation?: Angle | undefined;
  scale?: Point | undefined;
}) {
  useType(Geometry);

  const size = new Point(shape.width, shape.height);
  useInspectorHoverOutline(size);

  const geometry = {
    shape,
    position,
    rotation,
    scale,
  };

  return geometry;
}

export default Geometry;
