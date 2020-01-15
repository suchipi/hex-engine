import { useRawDraw } from "../Canvas";
import useEntityTransforms from "./useEntityTransforms";

export default function useDraw(
  onDraw: (
    context: CanvasRenderingContext2D,
    backstage: CanvasRenderingContext2D
  ) => void
) {
  const transforms = useEntityTransforms();

  useRawDraw((context, backstage) => {
    transforms.applyToContext(context);

    onDraw(context, backstage);

    transforms.resetContext(context);
  });
}
