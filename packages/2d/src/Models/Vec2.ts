export default class Vec2 {
  x: number;
  y: number;

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

  subtract(other: Vec2 | number): Vec2 {
    if (typeof other === "number") {
      return new Vec2(this.x - other, this.y - other);
    } else {
      return new Vec2(this.x - other.x, this.y - other.y);
    }
  }

  times(other: Vec2 | number): Vec2 {
    let otherVec2: Vec2;
    if (typeof other === "number") {
      otherVec2 = new Vec2(other, other);
    } else {
      otherVec2 = other;
    }

    return new Vec2(this.x * otherVec2.x, this.y * otherVec2.y);
  }

  dividedBy(other: Vec2 | number): Vec2 {
    let otherVec2: Vec2;
    if (typeof other === "number") {
      otherVec2 = new Vec2(other, other);
    } else {
      otherVec2 = other;
    }

    return new Vec2(this.x / otherVec2.x, this.y / otherVec2.y);
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

  roundDown(): Vec2 {
    return new Vec2(Math.floor(this.x), Math.floor(this.y));
  }

  roundUp(): Vec2 {
    return new Vec2(Math.ceil(this.x), Math.ceil(this.y));
  }

  replace(other: Vec2) {
    this.x = other.x;
    this.y = other.y;
  }
}
