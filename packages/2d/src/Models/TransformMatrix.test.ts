import TransformMatrix from "./TransformMatrix";

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
