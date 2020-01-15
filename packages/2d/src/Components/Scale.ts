import { useType } from "@hex-engine/core";
import { Vec2 } from "../Models";

type ScaleFunc = {
  (): Vec2;
  (scaleFactor: Vec2): Vec2;
  (scaleFactor: number): Vec2;
  (scaleFactorX: number, scaleFactorY: number): Vec2;
};

const Scale: ScaleFunc = (...args: any[]) => {
  useType(Scale);

  let x = 1,
    y = 1;

  if (args.length === 1) {
    if (typeof args[0] === "number") {
      x = args[0];
      y = args[0];
    } else {
      const vec2 = args[0];
      x = vec2.x;
      y = vec2.y;
    }
  } else if (args.length === 2) {
    x = args[0];
    y = args[1];
  }

  return new Vec2(x, y);
};

export default Scale;
