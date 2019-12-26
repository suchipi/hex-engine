import Component, { ComponentConfig } from "./Component";
import { Point } from "../Models";

export default class Position extends Component {
  x: number;
  y: number;

  constructor(config: Point & ComponentConfig);
  constructor(point: Point, config: ComponentConfig);
  constructor(x: number, y: number, config: ComponentConfig);
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
    this.x = x;
    this.y = y;
  }
}
