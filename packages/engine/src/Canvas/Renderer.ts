import BaseComponent, { ComponentConfig } from "../Component";
import { Angle, Point } from "../Models";

type Data = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  backgroundColor: string;
};

export default class Renderer extends BaseComponent {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  backgroundColor: string;

  constructor(data: Data & Partial<ComponentConfig>) {
    super(data);
    this.canvas = data.canvas;
    this.context = data.context;
    this.backgroundColor = data.backgroundColor;
  }

  scale(point: Point): void;
  scale(x: number, y: number): void;
  scale(...args: Array<any>): void {
    const { context } = this;

    let x = 0;
    let y = 0;
    if (typeof args[0] === "object" && args[0] != null) {
      x = args[0].x;
      y = args[0].y;
    } else if (typeof args[0] === "number" && typeof args[1] === "number") {
      x = args[0];
      y = args[1];
    }

    context.scale(x, y);
  }

  translate(point: Point): void;
  translate(x: number, y: number): void;
  translate(...args: Array<any>): void {
    const { context } = this;

    let x = 0;
    let y = 0;
    if (typeof args[0] === "object" && args[0] != null) {
      x = args[0].x;
      y = args[0].y;
    } else if (typeof args[0] === "number" && typeof args[1] === "number") {
      x = args[0];
      y = args[1];
    }

    context.translate(x, y);
  }

  rotate(angle: number | Angle) {
    const { context } = this;

    let angleRad = 0;
    if (typeof angle === "number") {
      angleRad = angle;
    } else {
      angleRad = angle.radians;
    }

    context.rotate(angleRad);
  }

  render() {
    const { canvas, context, backgroundColor } = this;

    // Reset transform
    context.setTransform(1, 0, 0, 1, 0, 0);

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const entities = [];
    if (this.entity) {
      entities.push(this.entity);
      entities.push(...this.entity.children);
    }

    for (const entity of entities) {
      entity.draw({ canvas, context });
    }
  }
}
