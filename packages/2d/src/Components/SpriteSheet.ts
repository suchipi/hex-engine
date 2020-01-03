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
    drawSpriteIntoContext({
      context,
      x = 0,
      y = 0,
      tileIndex,
      width = tileWidth,
      height = tileHeight,
    }: {
      context: CanvasRenderingContext2D;
      x?: number | void;
      y?: number | void;
      tileIndex: number;
      width?: void | number;
      height?: void | number;
    }) {
      const data = image.data;
      if (data == null) return;

      const sourceWidth = tileWidth;
      const sourceHeight = tileHeight;

      let searchX = 0,
        searchY = 0;

      for (let i = 0; i < tileIndex; i++) {
        if (searchX + sourceWidth > data.width) {
          searchX = 0;
          searchY += sourceHeight;
        } else {
          searchX += sourceWidth;
        }
      }

      image.drawIntoContext({
        context,
        targetX: x,
        targetY: y,
        sourceX: searchX,
        sourceY: searchY,
        sourceWidth,
        sourceHeight,
        targetWidth: width,
        targetHeight: height,
      });
    },
  };
}
