import { useType } from "@hex-engine/core";
import { Angle, Point, Shape } from "../Models";
import {
  useInspectorHoverOutline,
  useEntityTransforms,
  useDebugOverlayDrawTime,
} from "../Hooks";

function Geometry<S extends Shape>({
  shape,
  position = new Point(0, 0),
  rotation = new Angle(0),
  scale = new Point(1, 1),
}: {
  shape: S;
  position?: Point | undefined;
  rotation?: Angle | undefined;
  scale?: Point | undefined;
}) {
  useType(Geometry);

  const transforms = useEntityTransforms();

  const geometry = {
    shape,
    position,
    rotation,
    scale,
    worldPosition() {
      const matrix = transforms.matrixForWorldPosition();
      return new Point(matrix.e, matrix.f);
    },
  };

  useDebugOverlayDrawTime();
  useInspectorHoverOutline(() => geometry.shape);

  return geometry;
}

export default Geometry;
