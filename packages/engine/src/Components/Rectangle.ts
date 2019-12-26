import Component, { ComponentConfig } from "./Component";
import Position from "./Position";

export default class Rectangle extends Component {
  width: number;
  height: number;
  color: string;

  constructor(
    width: number,
    height: number,
    color?: string,
    config?: ComponentConfig
  );
  constructor(
    config: {
      width: number;
      height: number;
      color: string;
    } & ComponentConfig
  );
  constructor(...args: Array<any>) {
    let width, height, color, config;

    if (typeof args[0] === "number" && typeof args[1] === "number") {
      width = args[0];
      height = args[1];
      color = args[2];
      config = args[3];
    } else if (typeof args[0] === "object" && args[0] != null) {
      width = args[0].width;
      height = args[0].height;
      color = args[0].color;
      config = args[0];
    }

    super(config ?? {});

    this.width = width ?? 100;
    this.height = height ?? 100;
    this.color = color ?? "red";
  }

  draw({
    context,
  }: {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
  }): void {
    const position = this.getComponent(Position);
    if (!position) return;
    const { x, y } = position;
    const { width, height, color } = this;

    context.fillStyle = color;
    context.fillRect(x, y, width, height);
  }
}
