import { useType, useEntity, useNewComponent } from "@hex-engine/core";
import { Vector, Shape } from "../Models";
import {
  useInspectorHoverOutline,
  useEntityTransforms,
  useDebugOverlayDrawTime,
  useInspectorSelectEntity,
  useEntitiesAtPoint,
} from "../Hooks";
import { LowLevelMouse } from "../Components";

/**
 * This Component provides information about the shape, position, rotation, and scale
 * of the current Entity. It is used by `useDraw` and `Physics.Body`, among other things.
 *
 * You should only have one `Geometry` component per `Entity`.
 */
function Geometry<S extends Shape>({
  shape,
  position = new Vector(0, 0),
  rotation = 0,
  scale = new Vector(1, 1),
}: {
  shape: S;
  position?: Vector | undefined;
  rotation?: number | undefined;
  scale?: Vector | undefined;
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
      return new Vector(matrix.e, matrix.f);
    },
  };

  const { onMouseDown } = useNewComponent(LowLevelMouse);

  onMouseDown(({ pos }) => {
    const worldPos = useEntityTransforms()
      .matrixForWorldPosition()
      .transformPoint(pos);

    const ent = useEntitiesAtPoint(worldPos)[0];
    useInspectorSelectEntity(() => ent);
  });

  useDebugOverlayDrawTime();
  useInspectorHoverOutline(() => geometry.shape);

  return geometry;
}

export default Geometry;
