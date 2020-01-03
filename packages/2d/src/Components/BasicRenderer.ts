import { useExistingComponentByType, useType } from "@hex-engine/core";
import { useDraw } from "../Canvas";
import AnimationSheet from "./AnimationSheet";
import TileMap from "./TileMap";
import Position from "./Position";
import Origin from "./Origin";
import Rotation from "./Rotation";
import { Vec2 } from "../Models";

export default function BasicRenderer() {
  useType(BasicRenderer);

  return useDraw((context) => {
    const position = useExistingComponentByType(Position);
    const worldPos = (position?.asWorldPosition() || new Vec2(0, 0)).round();

    let origin: Vec2 | null = useExistingComponentByType(Origin);
    if (!origin) origin = new Vec2(0, 0);

    context.save();

    const drawPos = worldPos.subtract(origin).round();
    context.translate(drawPos.x, drawPos.y);

    const animSheet = useExistingComponentByType(AnimationSheet);
    if (animSheet) {
      animSheet.drawSpriteIntoContext({ context });
    }

    const tileMap = useExistingComponentByType(TileMap);
    if (tileMap) {
      tileMap.drawMapIntoContext({ context });
    }

    context.restore();
  });
}
