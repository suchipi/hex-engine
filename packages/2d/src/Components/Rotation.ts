import { Angle } from "../Models";

export default function Rotation(angle: Angle | number) {
  return typeof angle === "number"
    ? new Angle(angle)
    : new Angle(angle.radians);
}
