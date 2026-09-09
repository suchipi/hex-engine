import TransformMatrix from "./TransformMatrix";
import Vector from "./Vector";

const components = (matrix: TransformMatrix) => [
  matrix.a,
  matrix.b,
  matrix.c,
  matrix.d,
  matrix.e,
  matrix.f,
];

const xy = (vector: Vector) => ({ x: vector.x, y: vector.y });

test("TransformMatrix empty constructor", () => {
  const mat = new TransformMatrix();
  expect(mat._matrix).toBeInstanceOf(DOMMatrix);
  // prettier-ignore
  expect([
    mat.a, mat.c, mat.e,
    mat.b, mat.d, mat.f
  ]).toEqual([
    1, 0, 0,
    0, 1, 0,
  ]);
});

test("TransformMatrix constructor with args", () => {
  const mat = new TransformMatrix(2, 3, 4, 5, 6, 7);
  expect(mat._matrix).toBeInstanceOf(DOMMatrix);
  // prettier-ignore
  expect([
    mat.a, mat.c, mat.e,
    mat.b, mat.d, mat.f
  ]).toEqual([
    2, 4, 6,
    3, 5, 7,
  ]);
});

test("TransformMatrix scale", () => {
  const mat = new TransformMatrix();
  const mat2 = mat.scale(2, 3, 0.3, 0.4);
  // prettier-ignore
  expect([
    mat2.a, mat2.c, mat2.e,
    mat2.b, mat2.d, mat2.f
  ]).toMatchObject([
    2, 0, -0.30000001192092896,
    0, 3, -0.8000000715255737,
  ]);
});

test("translate moves a point by the given amount", () => {
  const matrix = new TransformMatrix().translate(10, 20);

  expect(xy(matrix.transformPoint(new Vector(1, 2)))).toEqual({ x: 11, y: 22 });
  expect(components(matrix)).toEqual([1, 0, 0, 1, 10, 20]);
});

test("translate also accepts a Vector", () => {
  const fromNumbers = new TransformMatrix().translate(10, 20);
  const fromVector = new TransformMatrix().translate(new Vector(10, 20));

  expect(components(fromVector)).toEqual(components(fromNumbers));
});

test("the plain methods return a new matrix and leave this one alone", () => {
  const matrix = new TransformMatrix();

  matrix.translate(10, 20);
  matrix.rotate(Math.PI);
  matrix.scale(2, 2, 0, 0);

  expect(components(matrix)).toEqual([1, 0, 0, 1, 0, 0]);
});

test("the Mutate methods change this matrix and return it", () => {
  const matrix = new TransformMatrix();

  expect(matrix.translateMutate(10, 20)).toBe(matrix);
  expect(components(matrix)).toEqual([1, 0, 0, 1, 10, 20]);

  matrix.scaleMutate(2, 2, 0, 0);
  expect(components(matrix)).toEqual([2, 0, 0, 2, 10, 20]);
});

test("scaleMutate also accepts Vectors", () => {
  const fromNumbers = new TransformMatrix().scaleMutate(2, 3, 4, 5);
  const fromVectors = new TransformMatrix().scaleMutate(
    new Vector(2, 3),
    new Vector(4, 5)
  );

  expect(components(fromVectors)).toEqual(components(fromNumbers));
});

test("rotate takes radians and turns a point clockwise on screen", () => {
  const rotated = new TransformMatrix()
    .rotate(Math.PI / 2)
    .transformPoint(new Vector(10, 0));

  // Unlike Vector.rotate, this matches the direction Geometry's rotation uses.
  expect(rotated.x).toBeCloseTo(0);
  expect(rotated.y).toBeCloseTo(10);
});

test("transforms apply in the order they were chained", () => {
  const translateThenScale = new TransformMatrix()
    .translateMutate(10, 0)
    .scaleMutate(2, 2, 0, 0);
  const scaleThenTranslate = new TransformMatrix()
    .scaleMutate(2, 2, 0, 0)
    .translateMutate(10, 0);

  expect(xy(translateThenScale.transformPoint(new Vector(1, 0)))).toEqual({
    x: 12,
    y: 0,
  });
  expect(xy(scaleThenTranslate.transformPoint(new Vector(1, 0)))).toEqual({
    x: 22,
    y: 0,
  });
});

test("multiply combines two matrices", () => {
  const translate = new TransformMatrix().translate(10, 20);
  const scale = new TransformMatrix().scale(2, 2, 0, 0);

  const combined = translate.multiply(scale);

  expect(xy(combined.transformPoint(new Vector(1, 1)))).toEqual({
    x: 12,
    y: 22,
  });
});

test("multiply accepts a bare DOMMatrix too", () => {
  const translate = new TransformMatrix().translate(10, 20);
  const scale = new TransformMatrix().scale(2, 2, 0, 0);

  expect(components(translate.multiply(scale._matrix))).toEqual(
    components(translate.multiply(scale))
  );
});

test("inverse undoes the transform", () => {
  const matrix = new TransformMatrix().translateMutate(10, 20).rotateMutate(1);
  const point = new Vector(3, 7);

  const roundTripped = matrix
    .inverse()
    .transformPoint(matrix.transformPoint(point));

  expect(roundTripped.x).toBeCloseTo(3);
  expect(roundTripped.y).toBeCloseTo(7);
});

test("inverseMutate inverts in place and returns this matrix", () => {
  const matrix = new TransformMatrix().translateMutate(10, 20);

  expect(matrix.inverseMutate()).toBe(matrix);
  expect(xy(matrix.transformPoint(new Vector(10, 20)))).toEqual({ x: 0, y: 0 });
});

test("transformPoint leaves the point it is given alone, and transformPointMutate does not", () => {
  const matrix = new TransformMatrix().translate(10, 20);

  const untouched = new Vector(1, 2);
  matrix.transformPoint(untouched);
  expect(xy(untouched)).toEqual({ x: 1, y: 2 });

  const mutated = new Vector(1, 2);
  expect(matrix.transformPointMutate(mutated)).toBe(mutated);
  expect(xy(mutated)).toEqual({ x: 11, y: 22 });
});

test("fromDOMMatrix copies the six components across", () => {
  const source = new TransformMatrix(2, 3, 4, 5, 6, 7);

  expect(components(TransformMatrix.fromDOMMatrix(source._matrix))).toEqual([
    2, 3, 4, 5, 6, 7,
  ]);
});

test("the individual components can be written to", () => {
  const matrix = new TransformMatrix();

  matrix.a = 2;
  matrix.e = 10;

  expect(xy(matrix.transformPoint(new Vector(1, 0)))).toEqual({ x: 12, y: 0 });
});

test("known quirk: TransformMatrix.IDENTITY is a shared, mutable matrix", () => {
  // Nothing stops a caller from using a Mutate method on it and changing what
  // every later reader of TransformMatrix.IDENTITY sees.
  expect(components(TransformMatrix.IDENTITY)).toEqual([1, 0, 0, 1, 0, 0]);

  TransformMatrix.IDENTITY.translateMutate(5, 5);
  try {
    expect(components(TransformMatrix.IDENTITY)).toEqual([1, 0, 0, 1, 5, 5]);
  } finally {
    TransformMatrix.IDENTITY.translateMutate(-5, -5);
  }
});
