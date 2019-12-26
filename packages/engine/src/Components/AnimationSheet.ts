import BaseComponent, { ComponentConfig } from "../Component";
import SpriteSheet from "./SpriteSheet";
import Animation from "./Animation";
import Entity from "../Entity";

type Data = {
  url: string;
  tileWidth: number;
  tileHeight: number;
  animations: { [name: string]: Animation<number> };
};

export default class AnimationSheet extends BaseComponent {
  spriteSheet: SpriteSheet;
  animations: { [name: string]: Animation<number> };
  currentAnim: Animation<number>;

  constructor(config: Partial<ComponentConfig> & Data) {
    super(config);
    const { url, tileWidth, tileHeight } = config;
    this.spriteSheet = new SpriteSheet({ url, tileWidth, tileHeight });
    this.animations = Object.assign(
      {
        default: new Animation<number>({
          frames: [0],
          duration: 1000,
        }),
      },
      config.animations
    );
    this.currentAnim = this.animations.default;
    this.currentAnim.play();
  }

  onEntityReceived(ent: Entity | null) {
    ent?.addComponent(this.spriteSheet);
    Object.values(this.animations).forEach((anim) => {
      ent?.addComponent(anim);
    });
  }

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
    const frame = this.currentAnim.currentFrame;

    this.spriteSheet.drawSpriteIntoContext({
      context,
      x,
      y,
      width,
      height,
      tileIndex: frame,
    });
  }
}
