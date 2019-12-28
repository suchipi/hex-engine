import { onDraw, getComponent } from "@hex-engine/core";
import AnimationSheet from "./AnimationSheet";
import Position from "./Position";

export default function BasicRenderer() {
  onDraw(({ context }) => {
    const position = getComponent(Position);
    if (!position) return;

    const animSheet = getComponent(AnimationSheet);
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
