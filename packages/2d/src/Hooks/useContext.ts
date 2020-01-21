import { useRootEntity } from "@hex-engine/core";
import Canvas from "../Canvas";

/**
 * Returns the 2d rendering context of the root component's Canvas.
 * This is the same context that gets passed into `useDraw`'s callback.
 */
export default function useContext() {
  const canvas = useRootEntity().getComponent(Canvas);
  if (!canvas) {
    throw new Error("No canvas on root entity");
  }
  return canvas.context;
}
