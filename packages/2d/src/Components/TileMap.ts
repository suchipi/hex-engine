import { useType } from "@hex-engine/core";
import SpriteSheet from "./SpriteSheet";
import { Grid } from "../Models";

export default function TileMap(
  sheet: ReturnType<typeof SpriteSheet>,
  grid: Grid<number>
) {
  useType(TileMap);

  return {
    drawMapIntoContext({
      context,
      x,
      y,
    }: {
      context: CanvasRenderingContext2D;
      x: number;
      y: number;
    }) {
      for (const [gridX, gridY, tileIndex] of grid.contents()) {
        sheet.drawSpriteIntoContext({
          context,
          x: x + gridX * sheet.tileSize.x,
          y: y + gridY * sheet.tileSize.y,
          tileIndex,
        });
      }
    },
  };
}
