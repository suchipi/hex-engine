import {
  useExistingComponentByType,
  useCallbackAsCurrent,
} from "@hex-engine/core";
import { Position, Origin, Rotation, Scale } from "../Components";
import { Vec2 } from "../Models";

export default function useEntityTransforms() {
  return {
    apply: useCallbackAsCurrent((context: CanvasRenderingContext2D) => {
      context.save();

      const position = useExistingComponentByType(Position);
      const worldPos = position?.asWorldPosition() || new Vec2(0, 0);

      let origin: Vec2 | null = useExistingComponentByType(Origin);
      if (!origin) origin = new Vec2(0, 0);
      const drawPos = worldPos.subtract(origin).round();
      context.translate(drawPos.x, drawPos.y);

      const rotation = useExistingComponentByType(Rotation);
      if (rotation) {
        context.translate(origin.x, origin.y);
        context.rotate(rotation.radians);
        context.translate(-origin.x, -origin.y);
      }

      const scale = useExistingComponentByType(Scale);
      if (scale) {
        context.scale(scale.x, scale.y);
      }
    }),
    reset: useCallbackAsCurrent((context: CanvasRenderingContext2D) => {
      context.restore();
    }),
  };
}
