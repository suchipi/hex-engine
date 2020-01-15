import { useCallbackAsCurrent, useEntity, Entity } from "@hex-engine/core";
import { Vec2, TransformMatrix } from "../Models";
import { Position, Origin, Rotation, Scale } from "../Components";

function getEntityTransformMatrix(entity: Entity) {
  let matrix = new TransformMatrix();

  const position = entity.getComponent(Position) || new Vec2(0, 0);

  let origin: Vec2 | null = entity.getComponent(Origin);
  if (!origin) origin = new Vec2(0, 0);
  const drawPos = position.subtract(origin).round();
  matrix = matrix.translate(drawPos);

  const rotation = entity.getComponent(Rotation);
  if (rotation) {
    matrix = matrix.translate(origin);
    matrix = matrix.rotate(rotation);
    matrix = matrix.translate(-origin.x, -origin.y);
  }

  const scale = entity.getComponent(Scale);
  if (scale) {
    matrix.scale(scale, origin);
  }

  return matrix;
}

export default function useEntityTransforms() {
  const asMatrix = useCallbackAsCurrent(() => {
    const entity = useEntity();
    const ancestors = entity.ancestors();

    let matrix = new TransformMatrix();
    for (const ancestor of ancestors) {
      matrix = matrix.times(getEntityTransformMatrix(ancestor));
    }
    matrix = matrix.times(getEntityTransformMatrix(entity));

    return matrix;
  });

  return {
    asMatrix,
    applyToContext: useCallbackAsCurrent(
      (context: CanvasRenderingContext2D) => {
        context.save();

        const matrix = asMatrix();

        context.transform(
          matrix.a,
          matrix.b,
          matrix.c,
          matrix.d,
          matrix.e,
          matrix.f
        );
      }
    ),
    resetContext: useCallbackAsCurrent((context: CanvasRenderingContext2D) => {
      context.restore();
    }),
  };
}
