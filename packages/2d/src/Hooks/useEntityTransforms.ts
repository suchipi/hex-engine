import { useCallbackAsCurrent, useEntity, Entity } from "@hex-engine/core";
import { Point, TransformMatrix } from "../Models";
import { Position, Origin, Rotation, Scale } from "../Components";

function getEntityTransformMatrix(entity: Entity) {
  const matrix = new TransformMatrix();

  const position = entity.getComponent(Position) || new Point(0, 0);

  let origin: Point | null = entity.getComponent(Origin);
  if (!origin) origin = new Point(0, 0);
  const drawPos = position.subtract(origin).round();
  matrix.translateMutate(drawPos);

  const rotation = entity.getComponent(Rotation);
  if (rotation) {
    matrix.translateMutate(origin);
    matrix.rotateMutate(rotation);
    matrix.translateMutate(-origin.x, -origin.y);
  }

  const scale = entity.getComponent(Scale);
  if (scale) {
    matrix.scaleMutate(scale, origin);
  }

  return matrix;
}

export default function useEntityTransforms() {
  const asMatrix = useCallbackAsCurrent(() => {
    const entity = useEntity();
    const ancestors = entity.ancestors();

    const matrix = new TransformMatrix();
    for (const ancestor of ancestors) {
      matrix.timesMutate(getEntityTransformMatrix(ancestor));
    }
    matrix.timesMutate(getEntityTransformMatrix(entity));

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
