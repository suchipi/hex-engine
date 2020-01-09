import { useType } from "@hex-engine/core";
import { Vec2 } from "../Models";

export default function Scale(scaleFactor: Vec2 | number = 1): Vec2 {
  useType(Scale);
  if (typeof scaleFactor === "number") {
    return new Vec2(scaleFactor, scaleFactor);
  } else {
    return new Vec2(scaleFactor.x, scaleFactor.y);
  }
}
