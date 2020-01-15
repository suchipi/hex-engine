import { useType } from "@hex-engine/core";
import SpriteSheet from "./SpriteSheet";
import { Grid } from "../Models";

export default function TileMap(
  sheet: ReturnType<typeof SpriteSheet>,
  grid: Grid<number>
) {
  useType(TileMap);

  return {
    draw(
      context: CanvasRenderingContext2D,
      {
        x = 0,
        y = 0,
      }: {
        x?: number | void;
        y?: number | void;
      } = {}
    ) {
      for (const [gridX, gridY, tileIndex] of grid.contents()) {
        if (tileIndex === -1) continue;

        sheet.draw(context, {
          x: x + gridX * sheet.tileSize.x,
          y: y + gridY * sheet.tileSize.y,
          tileIndex,
        });
      }
    },
  };
}
