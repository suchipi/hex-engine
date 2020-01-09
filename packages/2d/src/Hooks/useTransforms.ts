import {
  useExistingComponentByType,
  useCallbackAsCurrent,
} from "@hex-engine/core";
import { Position, Origin, Rotation } from "../Components";
import { Vec2 } from "../Models";

export default function useTransforms() {
  return {
    apply: useCallbackAsCurrent((context: CanvasRenderingContext2D) => {
      const position = useExistingComponentByType(Position);
      const worldPos = position?.asWorldPosition() || new Vec2(0, 0);

      let origin: Vec2 | null = useExistingComponentByType(Origin);
      if (!origin) origin = new Vec2(0, 0);

      context.save();

      const drawPos = worldPos.subtract(origin).round();
      context.translate(drawPos.x, drawPos.y);

      const rotation = useExistingComponentByType(Rotation);
      if (rotation) {
        context.translate(origin.x, origin.y);
        context.rotate(rotation.radians);
        context.translate(-origin.x, -origin.y);
      }
    }),
    reset: useCallbackAsCurrent((context: CanvasRenderingContext2D) => {
      context.restore();
    }),
  };
}
