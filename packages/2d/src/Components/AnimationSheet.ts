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

  return {
    get currentAnim() {
      return currentAnim;
    },
    set currentAnim(nextValue) {
      currentAnim = nextValue;
    },
    draw(
      context: CanvasRenderingContext2D,
      {
        x,
        y,
        width,
        height,
      }: {
        x?: number | undefined;
        y?: number | undefined;
        width?: number | undefined;
        height?: number | undefined;
      } = {}
    ) {
      const frame = currentAnim.currentFrame;

      spriteSheet.draw(context, {
        x,
        y,
        width,
        height,
        tileIndex: frame.data,
      });
    },
  };
}
