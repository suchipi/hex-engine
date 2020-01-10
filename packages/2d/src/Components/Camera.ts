import { useExistingComponentByType, useType } from "@hex-engine/core";
import { useRawDraw } from "../Canvas";
import Position from "./Position";
import Rotation from "./Rotation";
import Scale from "./Scale";

export default function Camera() {
  useType(Camera);

  const state = {
    // this property indicates to the Canvas.DrawOrder's default
    // sort algorithm that we should be drawn before other entities
    isCamera: true,
  };

  useRawDraw((context) => {
    const position = useExistingComponentByType(Position);
    if (position) {
      const worldPos = position.asWorldPosition();
      context.translate(-worldPos.x, -worldPos.y);
    }

    const rotation = useExistingComponentByType(Rotation);
    if (rotation) {
      context.rotate(-rotation.radians);
    }

    const scale = useExistingComponentByType(Scale);
    if (scale) {
      context.scale(1 / scale.x, 1 / scale.y);
    }
  });

  return state;
}
