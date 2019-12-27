import Component, { ComponentConfig } from "../Component";
import { Point } from "../Models";

type PointOrSizeLike = Partial<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export default class Size extends Component {
  point: Point;

  constructor(config: PointOrSizeLike & ComponentConfig);
  constructor(point: PointOrSizeLike, config?: ComponentConfig);
  constructor(width: number, height: number, config?: ComponentConfig);
  constructor(...args: Array<any>) {
    let width, height, config;

    if (typeof args[0] === "number" && typeof args[1] === "number") {
      [width, height] = args;
    } else if (typeof args[0] === "object" && args[0] != null) {
      const obj = args[0];
      width = obj.width ?? obj.x;
      height = obj.height ?? obj.y;
      config = obj;
    }

    width = width ?? 0;
    height = height ?? 0;
    config = config ?? {};

    super(config);
    this.point = new Point(width, height);
  }
}
