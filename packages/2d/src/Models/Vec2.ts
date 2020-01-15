export default class Vec2 {
  x: number;
  y: number;
  _kind: "Vec2" = "Vec2";

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(other: Vec2 | number): Vec2 {
    if (typeof other === "number") {
      return new Vec2(this.x + other, this.y + other);
    } else {
      return new Vec2(this.x + other.x, this.y + other.y);
    }
  }

  addMutate(other: Vec2 | number): this {
    if (typeof other === "number") {
      this.x += other;
      this.y += other;
    } else {
      this.x += other.x;
      this.y += other.y;
    }
    return this;
  }

  subtract(other: Vec2 | number): Vec2 {
    if (typeof other === "number") {
      return new Vec2(this.x - other, this.y - other);
    } else {
      return new Vec2(this.x - other.x, this.y - other.y);
    }
  }

  subtractMutate(other: Vec2 | number): this {
    if (typeof other === "number") {
      this.x -= other;
      this.y -= other;
    } else {
      this.x -= other.x;
      this.y -= other.y;
    }
    return this;
  }

  times(other: Vec2 | number): Vec2 {
    if (typeof other === "number") {
      return new Vec2(this.x * other, this.y * other);
    } else {
      return new Vec2(this.x * other.x, this.y * other.y);
    }
  }

  timesMutate(other: Vec2 | number): this {
    if (typeof other === "number") {
      this.x *= other;
      this.y *= other;
    } else {
      this.x *= other.x;
      this.y *= other.y;
    }
    return this;
  }

  dividedBy(other: Vec2 | number): Vec2 {
    if (typeof other === "number") {
      return new Vec2(this.x / other, this.y / other);
    } else {
      return new Vec2(this.x / other.x, this.y / other.y);
    }
  }

  dividedByMutate(other: Vec2 | number): this {
    if (typeof other === "number") {
      this.x /= other;
      this.y /= other;
    } else {
      this.x /= other.x;
      this.y /= other.y;
    }
    return this;
  }

  equals(other: Vec2): boolean {
    return this.x === other.x && this.y === other.y;
  }

  distanceTo(other: Vec2): number {
    return Math.sqrt(
      Math.pow(other.x - this.x, 2) + Math.pow(other.y - this.y, 2)
    );
  }

  round(): Vec2 {
    return new Vec2(Math.round(this.x), Math.round(this.y));
  }

  roundMutate(): this {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }

  roundDown(): Vec2 {
    return new Vec2(Math.floor(this.x), Math.floor(this.y));
  }

  roundDownMutate(): this {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  }

  roundUp(): Vec2 {
    return new Vec2(Math.ceil(this.x), Math.ceil(this.y));
  }

  roundUpMutate(): this {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
  }

  mutateInto(other: Vec2) {
    this.x = other.x;
    this.y = other.y;
  }

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
      throw new Error("Unable to convert Vec2 to DOMPoint on this browser");
    }
  }

  transformUsingMatrix(matrix: DOMMatrix): Vec2 {
    const domPoint = this.asDOMPoint();
    const transformed = domPoint.matrixTransform(matrix);
    return new Vec2(transformed.x, transformed.y);
  }

  transformUsingMatrixMutate(matrix: DOMMatrix): this {
    const domPoint = this.asDOMPoint();
    const transformed = domPoint.matrixTransform(matrix);
    this.x = transformed.x;
    this.y = transformed.y;
    return this;
  }
}
