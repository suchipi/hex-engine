import { useCallbackAsCurrent, useEntity, Entity } from "@hex-engine/core";
import { Vector, TransformMatrix } from "../Models";
import { Geometry } from "../Components";

function getEntityTransformMatrix(entity: Entity) {
  const matrix = new TransformMatrix();

  const geometry = entity.getComponent(Geometry);
  if (!geometry) {
    return matrix;
  }

  matrix.translateMutate(geometry.position);
  matrix.translateMutate(geometry.origin);
  matrix.rotateMutate(geometry.rotation);
  matrix.scaleMutate(geometry.scale, new Vector(0, 0));

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

  matrix.translateMutate(geometry.position);
  matrix.rotateMutate(geometry.rotation);

  // It's easier to draw things from the top-left, so move
  // the canvas there instead of to the center.

  // HACK: To avoid allocating a new vector, we mutate the origin and then mutate it right back.
  geometry.origin.oppositeMutate();
  matrix.translateMutate(geometry.origin);
  geometry.origin.oppositeMutate();

  const topLeft = new Vector(
    geometry.shape.width / 2,
    geometry.shape.height / 2
  ).oppositeMutate();

  matrix.translateMutate(topLeft);

  matrix.scaleMutate(geometry.scale, topLeft.opposite());

  if (roundToNearestPixel) {
    matrix.e = Math.round(matrix.e);
    matrix.f = Math.round(matrix.f);
  }

  return matrix;
}

/**
 * Get the matrix transforms for the specified Entity.
 * @param entity The entity to get the transforms for. If unspecified, this function will use the result of `useEntity()`.
 */
export default function useEntityTransforms(entity = useEntity()) {
  const matrixForWorldPosition = useCallbackAsCurrent(
    (getTransform: typeof getEntityTransformMatrix) => {
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
    /** Returns a transformation matrix that will turn a position relative to the Entity into a world position. */
    matrixForWorldPosition: matrixForWorldPosition.bind(
      null,
      getEntityTransformMatrix
    ),
    /** Returns a transformation matrix that will turn a position relative to the Entity into a world position, relative to the Entity's top-left corner. */
    matrixForDrawPosition: useCallbackAsCurrent(
      (roundToNearestPixel: boolean) => {
        return matrixForWorldPosition((someEnt) => {
          if (someEnt === entity) {
            return getEntityTransformMatrixForContext(
              someEnt,
              roundToNearestPixel
            );
          } else {
            return getEntityTransformMatrix(someEnt);
          }
        });
      }
    ),
  };
}
