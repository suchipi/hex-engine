import { useType } from "@hex-engine/core";
import { Point } from "../Models";

type PositionFunc = {
  (): Point;
  (point: Point): Point;
  (x: number, y: number): Point;
};

const Position: PositionFunc = (...args: any[]) => {
  useType(Position);

  let x = 0,
    y = 0;
  if (args.length === 1) {
    const point = args[0];
    x = point.x;
    y = point.y;
  } else if (args.length === 2) {
    x = args[0];
    y = args[1];
  }

  return new Point(x, y);
};

export default Position;
