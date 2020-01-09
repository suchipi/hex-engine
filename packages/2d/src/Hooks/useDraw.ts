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
    transforms.apply(context);

    onDraw(context, backstage);

    transforms.reset(context);
  });
}
