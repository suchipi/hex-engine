import { useType } from "@hex-engine/core";
import { Vec2 } from "../Models";

export default function Position(position = new Vec2(0, 0)) {
  useType(Position);
  return position;
}
