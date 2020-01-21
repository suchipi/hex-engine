import { useRootEntity } from "@hex-engine/core";
import Canvas from "../Canvas";

/**
 * Returns a "backstage" canvas context that gets cleared between every component draw.
 * The canvas associated with this backstage context is never shown to the user.
 * You can use this backstage context as a working space to render into, if needed.
 */
export default function useBackstage() {
  const canvas = useRootEntity().getComponent(Canvas);
  if (!canvas) {
    throw new Error("No canvas on root entity");
  }
  return canvas.backstage;
}
