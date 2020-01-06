import { useType } from "@hex-engine/core";
import { Vec2 } from "../Models";

export default function BoundingBox(vec2: Vec2) {
  useType(BoundingBox);
  return vec2;
}
