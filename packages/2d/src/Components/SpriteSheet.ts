import { useNewComponent, useType } from "@hex-engine/core";
import Image from "./Image";
import { Vec2 } from "../Models";

type Props = {
  url: string;
  tileWidth: number;
  tileHeight: number;
};

export default function SpriteSheet({ url, tileWidth, tileHeight }: Props) {
  useType(SpriteSheet);

  const image = useNewComponent(() => Image({ url }));

  return {
    tileSize: new Vec2(tileWidth, tileHeight),
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
