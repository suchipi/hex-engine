import { useExistingComponent } from "@hex-engine/core";
import { useDraw } from "../Canvas";
import AnimationSheet from "./AnimationSheet";
import Position from "./Position";
import Origin from "./Origin";
import { Vec2 } from "../Models";

export default function BasicRenderer() {
  return useDraw((context) => {
    const position = useExistingComponent(Position);
    if (!position) return;

    const animSheet = useExistingComponent(AnimationSheet);
    if (!animSheet) return;

    let origin: Vec2 | null = useExistingComponent(Origin);
    if (!origin) origin = new Vec2(0, 0);

    const target = position.subtract(origin).round();

    // TODO: Rotation

    animSheet.drawSpriteIntoContext({
      context,
      x: target.x,
      y: target.y,
    });
  });
}
