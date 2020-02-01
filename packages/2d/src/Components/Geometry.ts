import { useType } from "@hex-engine/core";
import { Point, Shape } from "../Models";
import {
  useInspectorHoverOutline,
  useEntityTransforms,
  useDebugOverlayDrawTime,
} from "../Hooks";

/**
 * This Component provides information about the shape, position, rotation, and scale
 * of the current Entity. It is used by `useDraw` and `Physics.Body`, among other things.
 *
 * You should only have one `Geometry` component per `Entity`.
 */
function Geometry<S extends Shape>({
  shape,
  position = new Point(0, 0),
  rotation = 0,
  scale = new Point(1, 1),
}: {
  shape: S;
  position?: Point | undefined;
  rotation?: number | undefined;
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
