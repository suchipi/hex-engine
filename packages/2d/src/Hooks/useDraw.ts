import { useRawDraw } from "../Canvas";
import useEntityTransforms from "./useEntityTransforms";

/**
 * Register a function to be called once per frame, after all `useUpdate` functions have been called.
 * The function will receive a 2d canvas context it can draw into.
 *
 * The context you receive will already be rotated and translated such that position 0, 0 is the upper-left
 * corner of the current Entity, so in most cases, you will not need to worry about x/y positioning.
 */
export default function useDraw(
  onDraw: (context: CanvasRenderingContext2D) => void,
  {
    roundToNearestPixel = false,
  }: {
    /** Whether you want to round the offset position for this Entity to the nearest pixel. When drawing pixelated sprites, you will probably want to set this to `true`. */
    roundToNearestPixel?: boolean | undefined;
  } = {}
) {
  const transforms = useEntityTransforms();

  useRawDraw((context) => {
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
    onDraw(context);

    context.restore();
  });
}
