import Point from "./Point";
import Angle from "./Angle";

/**
 * A representation of a 2D Vector, with an angle and magnitude.
 */
export default class Vector {
  /** The angle that the Vector is pointing in, clockwise relative to the X-axis. */
  angle: Angle;

  /** The length of the Vector. */
  magnitude: number;

  constructor(angle: Angle, magnitude: number) {
    this.angle = angle;
    this.magnitude = magnitude;
  }

  /** Creates a new Vector instance with the same values as this one. */
  clone() {
    return new Vector(this.angle.clone(), this.magnitude);
  }

  /** Creates a vector with tail at `first` and head at `second`. */
  static fromPoints(first: Point, second: Point): Vector {
    const angle = Angle.fromPoints(first, second);
    const magnitude = first.distanceTo(second);
    return new Vector(angle, magnitude);
  }

  /** Places this vector at the origin, and return the location of its head. */
  toPoint(): Point {
    const x = this.magnitude * Math.cos(this.angle.radians);
    const y = -(this.magnitude * Math.sin(this.angle.radians)); // Inverted because of canvas coordinate space
    return new Point(x, y);
  }

  /** Returns a new Vector whose angle is the same as this Vector and whose magnitude is multiplied by the specified amount. */
  multiply(amount: number): Vector {
    return new Vector(this.angle.clone(), this.magnitude * amount);
  }

  /** Mutates the current vector by multiplying its magnitude by the specified amount. */
  multiplyMutate(amount: number): this {
    this.magnitude *= amount;
    return this;
  }

  /** Returns a new Vector whose angle is the same as this Vector and whose magnitude is divided by the specified amount. */
  divide(amount: number): Vector {
    return new Vector(this.angle.clone(), this.magnitude / amount);
  }

  /** Mutates the current vector by dividing its magnitude by the specified amount. */
  divideMutate(amount: number): this {
    this.magnitude /= amount;
    return this;
  }
}
