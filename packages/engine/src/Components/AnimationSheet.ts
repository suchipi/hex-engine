import BaseComponent, {
  ComponentConfig,
  ComponentInterface,
} from "../Component";
import SpriteSheet from "./SpriteSheet";
import Animation from "./Animation";
import Position from "./Position";
import Entity from "../Entity";

class BasicAnimationSheetRenderer extends BaseComponent {
  draw({
    context,
  }: {
    context: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
  }): void {
    const position = this.getComponent(Position);
    if (!position) return;

    const animSheet = this.getComponent(AnimationSheet);
    if (!animSheet) return;

    const target = position.point.subtract(position.origin).round();

    animSheet.drawSpriteIntoContext({
      context,
      x: target.x,
      y: target.y,
    });
  }
}

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
  renderer: ComponentInterface | null;

  static BasicRenderer = BasicAnimationSheetRenderer;

  constructor(
    config: Partial<ComponentConfig> &
      Data &
      Partial<{
        renderer: ComponentInterface | null;
      }>
  ) {
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

    if (config.renderer === undefined) {
      this.renderer = new BasicAnimationSheetRenderer();
    } else {
      this.renderer = config.renderer;
    }
  }

  onEntityReceived(ent: Entity | null) {
    ent?.addComponent(this.spriteSheet);
    if (this.renderer != null) {
      ent?.addComponent(this.renderer);
    }
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
      tileIndex: frame.data,
    });
  }
}
