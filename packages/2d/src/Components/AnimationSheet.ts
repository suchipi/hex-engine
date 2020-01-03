import { useNewComponent, useType } from "@hex-engine/core";
import SpriteSheet from "./SpriteSheet";
import { AnimationAPI } from "./Animation";

type Props = {
  url: string;
  tileWidth: number;
  tileHeight: number;
  // You should call useNewComponent on these animations before passing them in
  animations: { [name: string]: AnimationAPI<number> };
};

export default function AnimationSheet({
  url,
  tileWidth,
  tileHeight,
  animations,
}: Props) {
  useType(AnimationSheet);

  const spriteSheet = useNewComponent(() =>
    SpriteSheet({
      url,
      tileWidth,
      tileHeight,
    })
  );

  let currentAnim = animations.default;
  currentAnim.play();

  return {
    get currentAnim() {
      return currentAnim;
    },
    set currentAnim(nextValue) {
      currentAnim = nextValue;
    },
    drawSpriteIntoContext({
      context,
      x,
      y,
      width,
      height,
    }: {
      context: CanvasRenderingContext2D;
      x?: number | void;
      y?: number | void;
      width?: number | void;
      height?: number | void;
    }) {
      const frame = currentAnim.currentFrame;

      spriteSheet.drawSpriteIntoContext({
        context,
        x,
        y,
        width,
        height,
        tileIndex: frame.data,
      });
    },
  };
}
