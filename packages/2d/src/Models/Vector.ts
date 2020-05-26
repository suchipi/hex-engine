/**
 * A generic object with an `x` and `y` property.
 *
 * A two-dimensional vector, used to represent points, sizes, and more.
 */
export default class Vector {
  x: number;
  y: number;

  set magnitude(newValue: number) {
    this.normalizeMutate();
    this.x *= newValue;
    this.y *= newValue;
  }
  get magnitude() {
    return Math.sqrt(Math.pow(0 - this.x, 2) + Math.pow(0 - this.y, 2));
  }

  get angle() {
    // Invert y component because JS math functions
    // assume normal coordinate space
    const radians = Math.atan2(-this.y, this.x);
    return radians;
  }
  set angle(newValue: number) {
    const x = this.magnitude * Math.cos(newValue);
    const y = -(this.magnitude * Math.sin(newValue)); // Inverted because of canvas coordinate space
    this.x = x;
    this.y = y;
  }

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /** Create a Point from any object with an x property and a y property. */
  static from({ x, y }: { x: number; y: number }): Vector {
    return new Vector(x, y);
  }

  /** Create a Point from an angle and magnitude. */
  static fromAngleAndMagnitude(angle: number, magnitude: number): Vector {
    const point = new Vector(1, 1);
    point.angle = angle;
    point.magnitude = magnitude;
    return point;
  }

  /** Create a new Point with the same x and y values as this one. */
  clone(): Vector {
    return new Vector(this.x, this.y);
  }

  /** Create a new Point whose x and y values have the opposite sign as this one's. */
  opposite(): Vector {
    return new Vector(-this.x, -this.y);
  }

  /** Mutate this Point so that its x and y values have the opposite sign. */
  oppositeMutate(): this {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }

  /** Create a new Point whose x and y values are equivalent to this one's, but with the specified value added. */
  add(other: Vector | number): Vector {
    if (typeof other === "number") {
      return new Vector(this.x + other, this.y + other);
    } else {
      return new Vector(this.x + other.x, this.y + other.y);
    }
  }

  /** Mutate this Point by adding the specified value to its x and y values. */
  addMutate(other: Vector | number): this {
    if (typeof other === "number") {
      this.x += other;
      this.y += other;
    } else {
      this.x += other.x;
      this.y += other.y;
    }
    return this;
  }

  /** Create a new Point whose x and y values are equivalent to this one's, but with the specified value added to the x value. */
  addX(amount: number): Vector {
    return new Vector(this.x + amount, this.y);
  }

  /** Mutate this Point by adding the specified value to its x value. */
  addXMutate(amount: number): this {
    this.x += amount;
    return this;
  }

  /** Create a new Point whose x and y values are equivalent to this one's, but with the specified value added to the y value. */
  addY(amount: number): Vector {
    return new Vector(this.x, this.y + amount);
  }

  /** Mutate this Point by adding the specified value to its y value. */
  addYMutate(amount: number): this {
    this.y += amount;
    return this;
  }

  /** Create a new Point whose x and y values are equivalent to this one's, but with the specified value subtracted. */
  subtract(other: Vector | number): Vector {
    if (typeof other === "number") {
      return new Vector(this.x - other, this.y - other);
    } else {
      return new Vector(this.x - other.x, this.y - other.y);
    }
  }

  /** Mutate this Point by subtracting the specified value from its x and y values. */
  subtractMutate(other: Vector | number): this {
    if (typeof other === "number") {
      this.x -= other;
      this.y -= other;
    } else {
      this.x -= other.x;
      this.y -= other.y;
    }
    return this;
  }

  /** Create a new Point whose x and y values are equivalent to this one's, but with the specified value subtracted from the x value. */
  subtractX(amount: number): Vector {
    return new Vector(this.x - amount, this.y);
  }

  /** Mutate this Point by subtracting the specified value from its x value. */
  subtractXMutate(amount: number): this {
    this.x -= amount;
    return this;
  }

  /** Create a new Point whose x and y values are equivalent to this one's, but with the specified value subtracted from the y value. */
  subtractY(amount: number): Vector {
    return new Vector(this.x, this.y - amount);
  }

  /** Mutate this Point by subtracting the specified value from its y value. */
  subtractYMutate(amount: number): this {
    this.y -= amount;
    return this;
  }

  /** Create a new Point whose x and y values are equivalent to this one's, but with each multiplied by the specified value. */
  multiply(other: Vector | number): Vector {
    if (typeof other === "number") {
      return new Vector(this.x * other, this.y * other);
    } else {
      return new Vector(this.x * other.x, this.y * other.y);
    }
  }

  /** Mutate this Point by multiplying its x and y values with the specified value. */
  multiplyMutate(other: Vector | number): this {
    if (typeof other === "number") {
      this.x *= other;
      this.y *= other;
    } else {
      this.x *= other.x;
      this.y *= other.y;
    }
    return this;
  }

  /** Create a new Point whose x and y values are equivalent to this one's, but with the x value multiplied by the specified value. */
  multiplyX(amount: number): Vector {
    return new Vector(this.x * amount, this.y);
  }

  /** Mutate this Point by multiplying its x value by the specified value. */
  multiplyXMutate(amount: number): this {
    this.x *= amount;
    return this;
  }

  /** Create a new Point whose x and y values are equivalent to this one's, but with the y value multiplied by the specified value. */
  multiplyY(amount: number): Vector {
    return new Vector(this.x, this.y * amount);
  }

  /** Mutate this Point by multiplying its y value by the specified value. */
  multiplyYMutate(amount: number): this {
    this.y *= amount;
    return this;
  }

  /** Create a new Point whose x and y values are equivalent to this one's, but with each divided by the specified value. */
  divide(other: Vector | number): Vector {
    if (typeof other === "number") {
      return new Vector(this.x / other, this.y / other);
    } else {
      return new Vector(this.x / other.x, this.y / other.y);
    }
  }

  /** Mutate this Point by dividing its x and y values by the specified value. */
  divideMutate(other: Vector | number): this {
    if (typeof other === "number") {
      this.x /= other;
      this.y /= other;
    } else {
      this.x /= other.x;
      this.y /= other.y;
    }
    return this;
  }

  /** Create a new Point whose x and y values are equivalent to this one's, but with its x value divided by the specified value. */
  divideX(amount: number): Vector {
    return new Vector(this.x / amount, this.y);
  }

  /** Mutate this Point by dividing its x value by the specified value. */
  divideXMutate(amount: number): this {
    this.x /= amount;
    return this;
  }

  /** Create a new Point whose x and y values are equivalent to this one's, but with its y value divided by the specified value. */
  divideY(amount: number): Vector {
    return new Vector(this.x, this.y / amount);
  }

  /** Mutate this Point by dividing its y value by the specified value. */
  divideYMutate(amount: number): this {
    this.y /= amount;
    return this;
  }

  /** Check if this Point and another Point have the same x and y values. */
  equals(other: Vector): boolean {
    return this.x === other.x && this.y === other.y;
  }

  /** Measure the distance between this Point and another Point. */
  distanceTo(other: Vector): number {
    return Math.sqrt(
      Math.pow(other.x - this.x, 2) + Math.pow(other.y - this.y, 2)
    );
  }

  /** Return a new Point that is the same as this Point, but with its x and y values rounded to the nearest integer. */
  round(): Vector {
    return new Vector(Math.round(this.x), Math.round(this.y));
  }

  /** Mutate this Point by rounding its x and y values to the nearest integer. */
  roundMutate(): this {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }

  /** Return a new Point that is the same as this Point, but with its x and y values rounded down to the nearest integer. */
  roundDown(): Vector {
    return new Vector(Math.floor(this.x), Math.floor(this.y));
  }

  /** Mutate this Point by rounding its x and y values down to the nearest integer. */
  roundDownMutate(): this {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  }

  /** Return a new Point that is the same as this Point, but with its x and y values rounded up to the nearest integer. */
  roundUp(): Vector {
    return new Vector(Math.ceil(this.x), Math.ceil(this.y));
  }

  /** Mutate this Point by rounding its x and y values up to the nearest integer. */
  roundUpMutate(): this {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
  }

  /** Mutate this Point by setting its x and y values to the values found on the provided object. */
  mutateInto(other: { x: number; y: number }) {
    this.x = other.x;
    this.y = other.y;
  }

  /** Create a new Point by normalizing the magnitude of this one. */
  normalize(): Vector {
    const existingMagnitude = this.magnitude;
    const normalizedX = this.x / existingMagnitude;
    const normalizedY = this.y / existingMagnitude;
    return new Vector(normalizedX, normalizedY);
  }

  /** Mutate this point by normalizing its magnitude. */
  normalizeMutate(): this {
    const existingMagnitude = this.magnitude;
    const normalizedX = this.x / existingMagnitude;
    const normalizedY = this.y / existingMagnitude;
    this.x = normalizedX;
    this.y = normalizedY;
    return this;
  }

  /** Create a new Point equivalent to this one but rotated by the specified amount (in radians), clockwise. */
  rotate(radians: number): Vector {
    const nextPoint = this.clone();
    nextPoint.angle += radians;
    return nextPoint;
  }

  /** Mutate this Point by rotating it the specified amount (in radians), clockwise. */
  rotateMutate(radians: number): this {
    this.angle += radians;
    return this;
  }

  /** Return the dot product with the other vector. If it's negative, they are in opposite directions */
  dotProduct(other: Vector): number {
    return other.x * this.x + other.y * this.y;
  }

  /** Create a DOMPoint with the same x and y values as this Point. */
  asDOMPoint(): DOMPoint {
    if (window.DOMPoint) {
      return new DOMPoint(this.x, this.y);
    }

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    if (typeof (g as any).createSVGPoint === "function") {
      const point = (g as any).createSVGPoint();
      point.x = this.x;
      point.y = this.y;
      return point;
    } else {
      throw new Error("Unable to convert Vector to DOMPoint in this browser");
    }
  }

  /** Create a new Point by transforming this Point using the provided DOMMatrix. */
  transformUsingMatrix(matrix: DOMMatrix): Vector {
    const domPoint = this.asDOMPoint();
    const transformed = domPoint.matrixTransform(matrix);
    return new Vector(transformed.x, transformed.y);
  }

  /** Mutate this Point by transforming its x and y values using the provided DOMMatrix. */
  transformUsingMatrixMutate(matrix: DOMMatrix): this {
    const domPoint = this.asDOMPoint();
    const transformed = domPoint.matrixTransform(matrix);
    this.x = transformed.x;
    this.y = transformed.y;
    return this;
  }
}
