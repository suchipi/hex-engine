import { useRootEntity } from "@hex-engine/core";
import Canvas from "../Canvas";

export default function useBackstage() {
  const canvas = useRootEntity().getComponent(Canvas);
  if (!canvas) {
    throw new Error("No canvas on root entity");
  }
  return canvas.backstage;
}
