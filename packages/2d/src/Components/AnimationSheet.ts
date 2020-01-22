import { useNewComponent, useType } from "@hex-engine/core";
import SpriteSheet from "./SpriteSheet";
import { AnimationAPI } from "./Animation";

/**
 * A Component representing an AnimationSheet image; that is, a filmstrip-style image
 * of sprites which should be rendered in a particular sequence as part of an animation.
 */
export default function AnimationSheet({
  url,
  tileWidth,
  tileHeight,
  animations,
}: {
  url: string;
  tileWidth: number;
  tileHeight: number;
  /** You should call useNewComponent on these animations before passing them in */
  animations: { [name: string]: AnimationAPI<number> };
}) {
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
    /** The current animation, that frames will be drawn from. */
    get currentAnim() {
      return currentAnim;
    },
    /** Sets which animation is the current animation. */
    set currentAnim(nextValue) {
      currentAnim = nextValue;
    },
    /** Draws the current animation's current frame into the provided canvas context. */
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
