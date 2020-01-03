import { useExistingComponentByType, useType } from "@hex-engine/core";
import { useDraw } from "../Canvas";
import AnimationSheet from "./AnimationSheet";
import Position from "./Position";
import Origin from "./Origin";
import { Vec2 } from "../Models";

export default function BasicRenderer() {
  useType(BasicRenderer);

  return useDraw((context) => {
    const position = useExistingComponentByType(Position);
    if (!position) return;

    const animSheet = useExistingComponentByType(AnimationSheet);
    if (!animSheet) return;

    let origin: Vec2 | null = useExistingComponentByType(Origin);
    if (!origin) origin = new Vec2(0, 0);

    const target = position
      .asWorldPosition()
      .subtract(origin)
      .round();

    // TODO: Rotation

    animSheet.drawSpriteIntoContext({
      context,
      x: target.x,
      y: target.y,
    });
  });
}
