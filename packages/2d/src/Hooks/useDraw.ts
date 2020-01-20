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

    const matrix = transforms.matrixForDrawPosition(roundToNearestPixel);
    context.transform(
      matrix.a,
      matrix.b,
      matrix.c,
      matrix.d,
      matrix.e,
      matrix.f
    );
    onDraw(context, backstage);

    context.restore();
  });
}
