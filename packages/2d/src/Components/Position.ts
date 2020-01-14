import { useType } from "@hex-engine/core";
import { Vec2 } from "../Models";

export default function Position(vec2?: Vec2) {
  useType(Position);
  if (vec2) {
    return new Vec2(vec2.x, vec2.y);
  } else {
    return new Vec2(0, 0);
  }
}
