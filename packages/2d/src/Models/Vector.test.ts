import Vector from "./Vector";

test("setting x and y", () => {
  const v = new Vector(1, 2);
  v.x = 3;
  expect(v.x).toBe(3);
  expect(v.y).toBe(2);
  v.y = 4;
  expect(v.x).toBe(3);
  expect(v.y).toBe(4);
});

test("magnitude", () => {
  const v = new Vector(1, 1);
  expect(v.magnitude).toBeCloseTo(Math.sqrt(2));

  v.magnitude = 2;
  expect(v.x).toBeCloseTo(Math.sqrt(2));
  expect(v.y).toBeCloseTo(Math.sqrt(2));
});

test("angle", () => {
  const v = new Vector(1, 1);
  expect(v.angle).toBe(-Math.PI / 4);

  v.angle = Math.PI / 4;
  expect(v.x).toBeCloseTo(1);
  expect(v.y).toBeCloseTo(-1);
});

test("fromAngleAndMagnitude", () => {
  const v = Vector.fromAngleAndMagnitude(Math.PI, 2);
  expect(v.x).toBeCloseTo(-2);
  expect(v.y).toBeCloseTo(0);
});

test("clone", () => {
  const v1 = new Vector(1, 2);
  const v2 = v1.clone();
  expect(v2).not.toBe(v1);
  expect(v2.x).toBe(v1.x);
  expect(v2.y).toBe(v1.y);
});

test("opposite", () => {
  const v1 = new Vector(1, 2);
  const v2 = v1.opposite();
  expect(v1).not.toBe(v2);
  expect(v1.x).toBe(1);
  expect(v1.y).toBe(2);
  expect(v2.x).toBe(-1);
  expect(v2.y).toBe(-2);
});

test("oppositeMutate", () => {
  const v1 = new Vector(1, 2);
  const v2 = v1.oppositeMutate();
  expect(v1).toBe(v2);
  expect(v1.x).toBe(-1);
  expect(v1.y).toBe(-2);
  expect(v2.x).toBe(-1);
  expect(v2.y).toBe(-2);
});

test("perpendicular", () => {
  const v1 = new Vector(3, 5);
  const v2 = v1.perpendicular();

  expect(v1.magnitude).toBeCloseTo(v2.magnitude);
  expect(v1.dotProduct(v2)).toBeCloseTo(0);
});

// etc

test("normalize", () => {
  const v1 = new Vector(1, 1);
  expect(v1.magnitude).toBeCloseTo(Math.sqrt(2));
  const v2 = v1.normalize();
  expect(v2.magnitude).toBeCloseTo(1);
  expect(v2.x).toBeCloseTo(1 / Math.sqrt(2));
  expect(v2.y).toBeCloseTo(1 / Math.sqrt(2));
});

const xy = (vector: Vector) => ({ x: vector.x, y: vector.y });

test("from copies x and y off any object that has them", () => {
  expect(xy(Vector.from({ x: 3, y: 4 }))).toEqual({ x: 3, y: 4 });
});

test("the plain arithmetic methods return a new Vector and leave this one alone", () => {
  const start = new Vector(10, 20);

  expect(xy(start.add(5))).toEqual({ x: 15, y: 25 });
  expect(xy(start.add(new Vector(1, 2)))).toEqual({ x: 11, y: 22 });
  expect(xy(start.subtract(5))).toEqual({ x: 5, y: 15 });
  expect(xy(start.subtract(new Vector(1, 2)))).toEqual({ x: 9, y: 18 });
  expect(xy(start.multiply(2))).toEqual({ x: 20, y: 40 });
  expect(xy(start.multiply(new Vector(2, 3)))).toEqual({ x: 20, y: 60 });
  expect(xy(start.divide(2))).toEqual({ x: 5, y: 10 });
  expect(xy(start.divide(new Vector(2, 4)))).toEqual({ x: 5, y: 5 });

  expect(xy(start)).toEqual({ x: 10, y: 20 });
});

test("the single-axis methods only touch the axis they name", () => {
  const start = new Vector(10, 20);

  expect(xy(start.addX(5))).toEqual({ x: 15, y: 20 });
  expect(xy(start.addY(5))).toEqual({ x: 10, y: 25 });
  expect(xy(start.subtractX(5))).toEqual({ x: 5, y: 20 });
  expect(xy(start.subtractY(5))).toEqual({ x: 10, y: 15 });
  expect(xy(start.multiplyX(2))).toEqual({ x: 20, y: 20 });
  expect(xy(start.multiplyY(2))).toEqual({ x: 10, y: 40 });
  expect(xy(start.divideX(2))).toEqual({ x: 5, y: 20 });
  expect(xy(start.divideY(2))).toEqual({ x: 10, y: 10 });
});

test("the Mutate methods change this Vector and return it", () => {
  const vector = new Vector(10, 20);

  expect(vector.addMutate(new Vector(1, 1))).toBe(vector);
  expect(xy(vector)).toEqual({ x: 11, y: 21 });

  vector.subtractMutate(1);
  expect(xy(vector)).toEqual({ x: 10, y: 20 });

  vector.multiplyMutate(2);
  expect(xy(vector)).toEqual({ x: 20, y: 40 });

  vector.divideMutate(new Vector(2, 4));
  expect(xy(vector)).toEqual({ x: 10, y: 10 });

  vector.addXMutate(1).addYMutate(2).subtractXMutate(3).subtractYMutate(4);
  expect(xy(vector)).toEqual({ x: 8, y: 8 });

  vector.multiplyXMutate(2).multiplyYMutate(3).divideXMutate(4);
  expect(xy(vector)).toEqual({ x: 4, y: 24 });
});

test("multiplying by a Vector multiplies each axis, rather than taking a dot product", () => {
  expect(xy(new Vector(2, 3).multiply(new Vector(4, 5)))).toEqual({
    x: 8,
    y: 15,
  });
  expect(new Vector(2, 3).dotProduct(new Vector(4, 5))).toBe(23);
});

test("equals compares values, not identity", () => {
  const vector = new Vector(1, 2);

  expect(vector.equals(new Vector(1, 2))).toBe(true);
  expect(vector.equals(vector.clone())).toBe(true);
  expect(vector.equals(new Vector(1, 3))).toBe(false);
});

test("distanceTo measures both ways the same", () => {
  const a = new Vector(0, 0);
  const b = new Vector(3, 4);

  expect(a.distanceTo(b)).toBe(5);
  expect(b.distanceTo(a)).toBe(5);
  expect(a.distanceTo(a)).toBe(0);
});

test("the rounding methods go to nearest, down, and up", () => {
  const vector = new Vector(1.5, -1.5);

  expect(xy(vector.round())).toEqual({ x: 2, y: -1 });
  expect(xy(vector.roundDown())).toEqual({ x: 1, y: -2 });
  expect(xy(vector.roundUp())).toEqual({ x: 2, y: -1 });
  expect(xy(vector)).toEqual({ x: 1.5, y: -1.5 });

  expect(xy(vector.clone().roundMutate())).toEqual({ x: 2, y: -1 });
  expect(xy(vector.clone().roundDownMutate())).toEqual({ x: 1, y: -2 });
  expect(xy(vector.clone().roundUpMutate())).toEqual({ x: 2, y: -1 });
});

test("mutateInto copies values from any object with x and y", () => {
  const vector = new Vector(1, 2);

  vector.mutateInto({ x: 9, y: 8 });

  expect(xy(vector)).toEqual({ x: 9, y: 8 });
});

test("known quirk: rotate turns counter-clockwise, the opposite of what it documents", () => {
  const rotated = new Vector(10, 0).rotate(Math.PI / 2);

  // rotate works by adding to `angle`, which is measured in the y-up convention,
  // so a positive amount moves a screen-space Vector counter-clockwise. Both
  // `perpendicular` and Geometry's `rotation` go the other way.
  expect(rotated.x).toBeCloseTo(0);
  expect(rotated.y).toBeCloseTo(-10);
  expect(rotated.magnitude).toBeCloseTo(10);

  expect(new Vector(10, 0).perpendicular().y).toBe(10);
});

test("rotateMutate turns this Vector and returns it", () => {
  const vector = new Vector(10, 0);

  expect(vector.rotateMutate(Math.PI)).toBe(vector);
  expect(vector.x).toBeCloseTo(-10);
  expect(vector.y).toBeCloseTo(0);
});

test("perpendicularMutate turns this Vector a quarter turn", () => {
  const vector = new Vector(3, 5);

  expect(vector.perpendicularMutate()).toBe(vector);
  expect(xy(vector)).toEqual({ x: -5, y: 3 });
});

test("dotProduct is negative when the Vectors point opposite ways", () => {
  expect(new Vector(1, 0).dotProduct(new Vector(-1, 0))).toBe(-1);
  expect(new Vector(1, 0).dotProduct(new Vector(0, 1))).toBe(0);
  expect(new Vector(1, 0).dotProduct(new Vector(1, 0))).toBe(1);
});

test("known quirk: normalizing a zero-length Vector produces NaN", () => {
  const normalized = new Vector(0, 0).normalize();

  // Normalizing divides by the magnitude, and nothing guards against that
  // magnitude being zero.
  expect(Number.isNaN(normalized.x)).toBe(true);
  expect(Number.isNaN(normalized.y)).toBe(true);
});

test("known quirk: setting a magnitude on a zero-length Vector produces NaN", () => {
  const vector = new Vector(0, 0);

  // The magnitude setter normalizes first, so it inherits the same problem, and
  // the Vector is left permanently unusable.
  vector.magnitude = 10;

  expect(Number.isNaN(vector.x)).toBe(true);
  expect(Number.isNaN(vector.y)).toBe(true);
});

test("known quirk: Vector.ZERO is a shared, writable Vector", () => {
  // It is typed as a ReadOnlyVector, but that is only a compile-time promise:
  // at runtime it is one Vector instance shared by everything that touches it.
  const asWritable = Vector.ZERO as Vector;
  expect(asWritable instanceof Vector).toBe(true);

  asWritable.x = 5;
  try {
    expect((Vector.ZERO as Vector).x).toBe(5);
  } finally {
    asWritable.x = 0;
  }
});

test("asDOMPoint carries the same coordinates", () => {
  const point = new Vector(3, 4).asDOMPoint();

  expect(point.x).toBe(3);
  expect(point.y).toBe(4);
});
