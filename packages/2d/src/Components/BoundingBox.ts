import { useType } from "@hex-engine/core";
import { Point } from "../Models";

export default function BoundingBox(point: Point) {
  useType(BoundingBox);
  return point.clone();
}
