import BaseComponent, { ComponentConfig } from "../Component";
import { Point } from "../Models";

type PointLike = {
  x: number;
  y: number;
};

type Config = {
  origin: Point;
};

export default class Position extends BaseComponent {
  point: Point;
  origin: Point;

  constructor(config: PointLike & Partial<ComponentConfig & Config>);
  constructor(point: PointLike, config?: Partial<ComponentConfig & Config>);
  constructor(x: number, y: number, config?: Partial<ComponentConfig & Config>);
  constructor(...args: Array<any>) {
    let x, y, config, origin;

    if (typeof args[0] === "number" && typeof args[1] === "number") {
      [x, y, config] = args;
    }
    if (typeof args[0] === "object" && args[0] != null) {
      const obj = args[0];
      x = obj.x;
      y = obj.y;
      origin = obj.origin;
      config = obj;
    }
    if (typeof args[1] === "object" && args[1] != null) {
      const obj = args[1];
      origin = obj.origin;
      config = obj;
    }
    if (typeof args[2] === "object" && args[2] != null) {
      const obj = args[2];
      origin = obj.origin;
      config = obj;
    }

    x = x ?? 0;
    y = y ?? 0;
    config = config ?? {};
    origin = origin ?? config.origin ?? new Point(0, 0);

    super(config);
    this.point = new Point(x, y);
    this.origin = origin;
  }
}
