import { useNewComponent, useType } from "@hex-engine/core";
import Image from "./Image";
import { Vector } from "../Models";

/**
 * A Component that helps you draw individual sprites from a sprite sheet.
 *
 * It is designed to be used with an image that is laid out like a film strip,
 * with many sprites on it. Each sprite will be assigned an index from left-to-right,
 * top-to-bottom (if there are multiple rows in the sheet), and you can specify which
 * index should be drawn to the canvas.
 */
export default function SpriteSheet({
  url,
  tileWidth,
  tileHeight,
}: {
  /**
   * The image URL.
   *
   * You can get a URL for an image on disk by `import`ing it, as if it was code:
   *
   * ```ts
   * import myImage from "./my-image.png";
   *
   * console.log(typeof myImage); // "string"
   * ```
   *
   * When you import an image in this way, it will be automatically
   * added to the build and included in the final build output.
   */
  url: string;

  /**
   * The width of each "tile" in the sheet, in pixels.
   */
  tileWidth: number;

  /**
   * The height of each "tile" in the sheet, in pixels.
   */
  tileHeight: number;
}) {
  useType(SpriteSheet);

  const image = useNewComponent(() => Image({ url }));

  return {
    /** The size of each tile in the sheet. */
    tileSize: new Vector(tileWidth, tileHeight),

    /** Draw the tile at the specified index into the canvas. */
    draw(
      context: CanvasRenderingContext2D,
      {
        x = 0,
        y = 0,
        tileIndex,
        width = tileWidth,
        height = tileHeight,
      }: {
        x?: number | void;
        y?: number | void;
        tileIndex: number;
        width?: void | number;
        height?: void | number;
      }
    ) {
      const data = image.data;
      if (data == null) return;

      const tilesPerRow = Math.floor(data.width / tileWidth);

      let tileX = tileIndex % tilesPerRow;
      let tileY = Math.floor(tileIndex / tilesPerRow);

      image.draw(context, {
        x,
        y,
        sourceX: tileX * tileWidth,
        sourceY: tileY * tileHeight,
        sourceWidth: tileWidth,
        sourceHeight: tileHeight,
        targetWidth: width,
        targetHeight: height,
      });
    },
  };
}
