import {
  useCallbackAsCurrent,
  useAncestorEntities,
  useEntity,
} from "@hex-engine/core";
import { TransformMatrix } from "../Models";
import useEntityTransformMatrix from "./useEntityTransformMatrix";

export default function useOwnAndAncestorEntityTransforms() {
  const asMatrix = useCallbackAsCurrent(() => {
    const ancestors = useAncestorEntities();

    let matrix = new TransformMatrix();
    for (const ancestor of ancestors) {
      matrix = matrix.times(useEntityTransformMatrix(ancestor));
    }
    matrix = matrix.times(useEntityTransformMatrix(useEntity()));

    return matrix;
  });

  return {
    asMatrix,
    apply: useCallbackAsCurrent((context: CanvasRenderingContext2D) => {
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
    }),
    reset: useCallbackAsCurrent((context: CanvasRenderingContext2D) => {
      context.restore();
    }),
  };
}
