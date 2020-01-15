import { useType } from "@hex-engine/core";
import { Point } from "../Models";

export default function BoundingBox(vec2: Point) {
  useType(BoundingBox);
  return vec2;
}
