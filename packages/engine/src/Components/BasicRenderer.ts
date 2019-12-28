import { useExistingComponent } from "@hex-engine/core";
import { useDraw } from "../Canvas";
import AnimationSheet from "./AnimationSheet";
import Position from "./Position";

export default function BasicRenderer() {
  return useDraw((context) => {
    const position = useExistingComponent(Position);
    if (!position) return;

    const animSheet = useExistingComponent(AnimationSheet);
    if (!animSheet) return;

    // TODO: Rotation

    const target = position.point.subtract(position.origin).round();

    animSheet.drawSpriteIntoContext({
      context,
      x: target.x,
      y: target.y,
    });
  });
}
