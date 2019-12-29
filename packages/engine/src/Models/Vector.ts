import Vec2 from "./Vec2";
import Angle from "./Angle";

export default class Vector {
  angle: Angle;
  magnitude: number;

  constructor(angle: Angle, magnitude: number) {
    this.angle = angle;
    this.magnitude = magnitude;
  }

  // Create a vector with tail at `first` and head at `second`.
  static fromPoints(first: Vec2, second: Vec2): Vector {
    const angle = Angle.fromPoints(first, second);
    const magnitude = first.distanceTo(second);
    return new Vector(angle, magnitude);
  }

  // Place a vector at the origin, and return the location of its head.
  toVec2(): Vec2 {
    const x = this.magnitude * Math.cos(this.angle.radians);
    const y = this.magnitude * Math.sin(this.angle.radians);
    return new Vec2(x, y);
  }
}
