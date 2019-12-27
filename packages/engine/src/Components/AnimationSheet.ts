import makeComponentClass from "../makeComponentClass";
import SpriteSheet from "./SpriteSheet";
import Animation from "./Animation";

type Config = {
  url: string;
  tileWidth: number;
  tileHeight: number;
  animations: { [name: string]: Animation<number> };
};

const AnimationSheet = makeComponentClass(
  (config: Config) => ({ addChildComponent }) => {
    const spriteSheet = addChildComponent(
      new SpriteSheet({
        url: config.url,
        tileWidth: config.tileWidth,
        tileHeight: config.tileHeight,
      })
    );

    const animations = Object.assign(
      {
        default: new Animation<number>({
          frames: [0],
          duration: 1000,
        }),
      },
      config.animations
    );

    Object.values(animations).forEach(addChildComponent);

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
        x: number;
        y: number;
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
);

export default AnimationSheet;
