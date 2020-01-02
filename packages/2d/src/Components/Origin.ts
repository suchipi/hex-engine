import { useType } from "@hex-engine/core";
import { Vec2 } from "../Models";

export default function Origin(origin = new Vec2(0, 0)) {
  useType(Origin);
  return origin;
}
