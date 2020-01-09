import { useExistingComponentByType, useType } from "@hex-engine/core";
import { useRawDraw } from "../Canvas";
import Position from "./Position";
import Rotation from "./Rotation";

export default function Camera(options?: { zoom: number }) {
  useType(Camera);

  const state = {
    // this property indicates to the Canvas.DrawOrder's default
    // sort algorithm that we should be drawn before other entities
    isCamera: true,

    zoom: (options && options.zoom) || 1,
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

    if (state.zoom) {
      context.scale(state.zoom, state.zoom);
    }
  });

  return state;
}
