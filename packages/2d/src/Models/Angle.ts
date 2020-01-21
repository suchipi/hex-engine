import Point from "./Point";
import Vector from "./Vector";

/**
 * An object which represents an Angle, in radians.
 *
 * Radians are expressed in canvas-style polar coordinate space,
 * which is like normal polar coordinate space but
 * the y-component is inverted, to match the
 * "0,0 is upper-left corner, y increases as
 * you go down" property of a canvas. So angle
 * increases as you go clockwise, decreases as
 * you go counter-clockwise.
 *
 * ```
 *           , - ~ ~ ~ - ,
 *       , '     3π/2      ' ,
 *     ,                       ,
 *    ,                         ,
 *   ,                           ,
 *   , π           .------------ , 0 or 2π
 *   ,                    ,      ,
 *    ,                  /      ,
 *     ,            < - '      ,
 *       ,        π/2       , '
 *         ' - , _ _ _ ,  '
 *
 * ```
 */
export default class Angle {
  /**
   * The Angle, in radians.
   *
   * Radians are expressed in canvas-style polar coordinate space,
   * which is like normal polar coordinate space but
   * the y-component is inverted, to match the
   * "0,0 is upper-left corner, y increases as
   * you go down" property of a canvas. So angle
   * increases as you go clockwise, decreases as
   * you go counter-clockwise.
   *
   * ```
   *           , - ~ ~ ~ - ,
   *       , '     3π/2      ' ,
   *     ,                       ,
   *    ,                         ,
   *   ,                           ,
   *   , π           .------------ , 0 or 2π
   *   ,                    ,      ,
   *    ,                  /      ,
   *     ,            < - '      ,
   *       ,        π/2       , '
   *         ' - , _ _ _ ,  '
   *
   * ```
   */
  radians: number;

  constructor(radians: number) {
    this.radians = radians;
  }

  /** Creates a copy of this Angle. */
  clone(): Angle {
    return new Angle(this.radians);
  }

  /**
   * Calculates the angle of the vector whose tail is at `first` and whose head
   * is at `second`.
   */
  static fromPoints(first: Point, second: Point): Angle {
    const deltaX = second.x - first.x;
    const deltaY = second.y - first.y;
    // Invert y component because JS math functions
    // assume normal polar coordinate space
    const radians = Math.atan2(-deltaY, deltaX);
    return new Angle(radians);
  }

  /**
   * Calculates the position of the head of a unit vector with the given angle
   * whose tail is at the origin.
   */
  toPoint(): Point {
    const vector = new Vector(this, 1);
    return vector.toPoint();
  }

  /**
   * Returns a new Angle whose value is equivalent to the value of the
   * current Angle plus the specified amount.
   *
   * This rotates the Angle clockwise.
   */
  add(amount: number | Angle): Angle {
    if (typeof amount === "number") {
      return new Angle(this.radians + amount);
    } else {
      return new Angle(this.radians + amount.radians);
    }
  }

  /**
   * Mutates the current Angle, adding the specified amount to its current value.
   *
   * This rotates the Angle clockwise.
   */
  addMutate(amount: number | Angle): this {
    if (typeof amount === "number") {
      this.radians += amount;
    } else {
      this.radians += amount.radians;
    }
    return this;
  }

  /**
   * Returns a new Angle whose value is equivalent to the value of the
   * current Angle minus the specified amount.
   *
   * This rotates the Angle counter-clockwise.
   */
  subtract(amount: number | Angle): Angle {
    if (typeof amount === "number") {
      return new Angle(this.radians - amount);
    } else {
      return new Angle(this.radians - amount.radians);
    }
  }

  /**
   * Mutates the current Angle, subtracting the specified amount from its current value.
   *
   * This rotates the Angle counter-clockwise.
   */
  subtractMutate(amount: number | Angle): this {
    if (typeof amount === "number") {
      this.radians -= amount;
    } else {
      this.radians -= amount.radians;
    }
    return this;
  }
}
