import { useExistingComponent } from "@hex-engine/core";
import { useDraw } from "../Canvas";
import Position from "./Position";
import Rotation from "./Rotation";

export default function Camera(options: void | { zoom: number }) {
  const state = {
    // indicates to the Canvas's UpdateChildren component that we should be drawn before other entities
    isCamera: true,
    zoom: (options && options.zoom) || 1,
    ...useDraw((context) => {
      const position = useExistingComponent(Position);
      if (position) {
        context.translate(-position.x, -position.y);
      }

      const rotation = useExistingComponent(Rotation);
      if (rotation) {
        context.rotate(-rotation.radians);
      }

      if (state.zoom) {
        context.scale(state.zoom, state.zoom);
      }
    }),
  };

  return state;
}
