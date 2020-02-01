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

// etc

test("normalize", () => {
  const v1 = new Vector(1, 1);
  expect(v1.magnitude).toBeCloseTo(Math.sqrt(2));
  const v2 = v1.normalize();
  expect(v2.magnitude).toBeCloseTo(1);
  expect(v2.x).toBeCloseTo(1 / Math.sqrt(2));
  expect(v2.y).toBeCloseTo(1 / Math.sqrt(2));
});
