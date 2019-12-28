import { Angle } from "../Models";

export default function Rotation(angle: Angle | number) {
  return {
    angle:
      typeof angle === "number" ? new Angle(angle) : new Angle(angle.radians),
  };
}
