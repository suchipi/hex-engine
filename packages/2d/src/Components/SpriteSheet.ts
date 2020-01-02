import {
  useNewComponent,
  useExistingComponentByType,
  useType,
} from "@hex-engine/core";
import Image from "./Image";
import Size from "./Size";
import { Vec2 } from "../Models";

type Props = {
  url: string;
  tileWidth: number;
  tileHeight: number;
};

export default function SpriteSheet({ url, tileWidth, tileHeight }: Props) {
  useType(SpriteSheet);

  const image = useNewComponent(() => Image({ url }));

  if (!useExistingComponentByType(Size)) {
    useNewComponent(() => Size(new Vec2(tileWidth, tileHeight)));
  }

  return {
    drawSpriteIntoContext({
      context,
      x,
      y,
      tileIndex,
      width = tileWidth,
      height = tileHeight,
    }: {
      context: CanvasRenderingContext2D;
      x: number;
      y: number;
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
