import { useType } from "@hex-engine/core";
import { Angle } from "../Models";

export default function Rotation(angle: Angle | number) {
  useType(Rotation);

  return typeof angle === "number"
    ? new Angle(angle)
    : new Angle(angle.radians);
}
