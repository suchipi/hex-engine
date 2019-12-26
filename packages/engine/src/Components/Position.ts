import BaseComponent, { ComponentConfig } from "../Component";
import { Point } from "../Models";

type PointLike = {
  x: number;
  y: number;
};

export default class Position extends BaseComponent {
  point: Point;

  constructor(config: PointLike & ComponentConfig);
  constructor(point: PointLike, config?: ComponentConfig);
  constructor(x: number, y: number, config?: ComponentConfig);
  constructor(...args: Array<any>) {
    let x, y, config;

    if (typeof args[0] === "number" && typeof args[1] === "number") {
      [x, y] = args;
    } else if (typeof args[0] === "object" && args[0] != null) {
      const obj = args[0];
      x = obj.x;
      y = obj.y;
      config = obj;
    }

    x = x ?? 0;
    y = y ?? 0;
    config = config ?? {};

    super(config);
    this.point = new Point(x, y);
  }
}
