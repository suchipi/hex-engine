import { useType } from "@hex-engine/core";
import { Vector, Shape } from "../Models";
import {
  useInspectorHoverOutline,
  useInspectorSelectEntity,
  useEntityTransforms,
  useDebugOverlayDrawTime,
} from "../Hooks";

const TAU = 2 * Math.PI;
/**
 * This Component provides information about the shape, position, rotation, origin, and scale
 * of the current Entity. It is used by `useDraw` and `Physics.Body`, among other things.
 *
 * You should only have one `Geometry` component per `Entity`.
 */
function Geometry<S extends Shape>({
  shape,
  position = new Vector(0, 0),
  rotation = 0,
  scale = new Vector(1, 1),
  origin = undefined,
}: {
  shape: S;
  position?: Vector | undefined;
  rotation?: number | undefined;
  scale?: Vector | undefined;
  origin?: Vector | undefined;
}) {
  useType(Geometry);

  const transforms = useEntityTransforms();

  let rotationVal = rotation;
  if (rotationVal > TAU) {
    rotationVal = rotationVal % TAU;
  }

  const geometry = {
    shape,
    position,
    get rotation() {
      return rotationVal;
    },
    set rotation(newVal) {
      if (newVal > TAU) {
        newVal = newVal % TAU;
      }
      rotationVal = newVal;
    },
    scale,
    origin: origin || new Vector(0, 0),
    worldPosition() {
      const matrix = transforms.matrixForWorldPosition();
      return new Vector(matrix.e, matrix.f);
    },
  };

  useDebugOverlayDrawTime();
  useInspectorHoverOutline(() => geometry.shape);
  useInspectorSelectEntity(() => geometry);

  return geometry;
}

export default Geometry;
