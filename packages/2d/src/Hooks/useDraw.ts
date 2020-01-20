import { useRawDraw } from "../Canvas";
import useEntityTransforms from "./useEntityTransforms";

export default function useDraw(
  onDraw: (
    context: CanvasRenderingContext2D,
    backstage: CanvasRenderingContext2D
  ) => void,
  {
    roundToNearestPixel = false,
  }: {
    roundToNearestPixel?: boolean | undefined;
  } = {}
) {
  const transforms = useEntityTransforms();

  useRawDraw((context, backstage) => {
    context.save();

    transforms.applyToContext(context, roundToNearestPixel);
    onDraw(context, backstage);

    context.restore();
  });
}
