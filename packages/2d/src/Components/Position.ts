import { useType } from "@hex-engine/core";
import { Vec2 } from "../Models";

type PositionFunc = {
  (): Vec2;
  (vec2: Vec2): Vec2;
  (x: number, y: number): Vec2;
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

  return new Vec2(x, y);
};

export default Position;
