import { useRawDraw } from "../Canvas";
import useOwnAndAncestorEntityTransforms from "./useOwnAndAncestorEntityTransforms";

export default function useDraw(
  onDraw: (
    context: CanvasRenderingContext2D,
    backstage: CanvasRenderingContext2D
  ) => void
) {
  const transforms = useOwnAndAncestorEntityTransforms();

  useRawDraw((context, backstage) => {
    transforms.apply(context);

    onDraw(context, backstage);

    transforms.reset(context);
  });
}
