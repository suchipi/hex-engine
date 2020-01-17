import { useCallbackAsCurrent, useEntity, Entity } from "@hex-engine/core";
import { Point, TransformMatrix } from "../Models";
import { Geometry } from "../Components";

function getEntityTransformMatrix(entity: Entity) {
  const matrix = new TransformMatrix();

  const geometry = entity.getComponent(Geometry);
  if (!geometry) {
    return matrix;
  }

  matrix.translateMutate(geometry.position);
  matrix.rotateMutate(geometry.rotation);
  matrix.scaleMutate(geometry.scale, new Point(0, 0));

  return matrix;
}

function getEntityTransformMatrixForContext(
  entity: Entity,
  roundToNearestPixel: boolean
) {
  const matrix = new TransformMatrix();

  const geometry = entity.getComponent(Geometry);
  if (!geometry) {
    return matrix;
  }

  if (roundToNearestPixel) {
    matrix.translateMutate(geometry.position.round());
  } else {
    matrix.translateMutate(geometry.position);
  }
  matrix.rotateMutate(geometry.rotation);

  // It's easier to draw things from the top-left, so move
  // the canvas there instead of to the center.
  const topLeft = new Point(
    geometry.shape.width / 2,
    geometry.shape.height / 2
  ).oppositeMutate();

  if (roundToNearestPixel) {
    topLeft.roundMutate();
  }
  matrix.translateMutate(topLeft);

  matrix.scaleMutate(geometry.scale, topLeft.opposite());

  return matrix;
}

export default function useEntityTransforms() {
  const asMatrix = useCallbackAsCurrent(
    (getTransform: typeof getEntityTransformMatrix) => {
      const entity = useEntity();
      const ancestors = entity.ancestors();

      const matrix = new TransformMatrix();
      for (const ancestor of ancestors) {
        matrix.multiplyMutate(getTransform(ancestor));
      }
      matrix.multiplyMutate(getTransform(entity));

      return matrix;
    }
  );

  return {
    asMatrix: asMatrix.bind(null, getEntityTransformMatrix),
    applyToContext: useCallbackAsCurrent(
      (context: CanvasRenderingContext2D, roundToNearestPixel: boolean) => {
        context.save();

        const entity = useEntity();
        const geometry = entity.getComponent(Geometry);
        if (!geometry) {
          return;
        }

        const matrix = asMatrix((context) =>
          getEntityTransformMatrixForContext(context, roundToNearestPixel)
        );

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
