import { useRawDraw } from "../Canvas";
import useTransforms from "./useTransforms";

export default function useDraw(
  onDraw: (context: CanvasRenderingContext2D) => void
) {
  const transforms = useTransforms();

  useRawDraw((context) => {
    transforms.apply(context);

    onDraw(context);

    transforms.reset(context);
  });
}
