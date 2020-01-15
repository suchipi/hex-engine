import { useType } from "@hex-engine/core";
import { Point } from "../Models";

type PositionFunc = {
  (): Point;
  (vec2: Point): Point;
  (x: number, y: number): Point;
};

const Position: PositionFunc = (...args: any[]) => {
  useType(Position);

  let x = 0,
    y = 0;
  if (args.length === 1) {
    const vec2 = args[0];
    x = vec2.x;
    y = vec2.y;
  } else if (args.length === 2) {
    x = args[0];
    y = args[1];
  }

  return new Point(x, y);
};

export default Position;
