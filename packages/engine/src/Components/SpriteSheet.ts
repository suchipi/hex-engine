import Component, { ComponentConfig } from "../Component";
import Image from "./Image";
import Size from "./Size";
import Entity from "../Entity";

type Data = {
  url: string;
  tileWidth: number;
  tileHeight: number;
};

export default class SpriteSheet extends Component {
  image: Image;
  tileWidth: number;
  tileHeight: number;

  constructor(config: Partial<ComponentConfig> & Data) {
    super(config);
    this.image = new Image({ url: config.url });
    this.tileWidth = config.tileWidth;
    this.tileHeight = config.tileHeight;
  }

  onEntityReceived(ent: Entity | null) {
    ent?.addComponent(this.image);

    if (ent && !ent?.hasComponent(Size)) {
      ent.addComponent(
        new Size({ width: this.tileWidth, height: this.tileHeight })
      );
    }
  }

  drawSpriteIntoContext({
    context,
    x,
    y,
    tileIndex,
    width = this.tileWidth,
    height = this.tileHeight,
  }: {
    context: CanvasRenderingContext2D;
    x: number;
    y: number;
    tileIndex: number;
    width?: void | number;
    height?: void | number;
  }) {
    const data = this.image.data;
    if (data == null) return;

    const sourceWidth = this.tileWidth;
    const sourceHeight = this.tileHeight;

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

    this.image.drawIntoContext({
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
  }
}
