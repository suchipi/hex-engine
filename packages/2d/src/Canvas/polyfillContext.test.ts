/// <reference types="@test-it/core/globals" />
import polyfillContext from "./polyfillContext";

function freshContext() {
  const canvas = document.createElement("canvas");
  canvas.width = 100;
  canvas.height = 100;
  return canvas.getContext("2d")!;
}

/**
 * A context with resetTransform and getTransform hidden, so that polyfillContext
 * actually installs its replacement rather than returning early.
 */
function contextNeedingThePolyfill() {
  const context = freshContext();

  // polyfillContext returns early unless both of these are missing. They are
  // hidden with own properties, and those are removed again afterward so that
  // the polyfilled prototype's versions are what the test sees.
  Object.defineProperty(context, "resetTransform", {
    configurable: true,
    value: undefined,
  });
  Object.defineProperty(context, "getTransform", {
    configurable: true,
    value: undefined,
  });

  const polyfilled = polyfillContext(context)!;

  delete (polyfilled as Partial<CanvasRenderingContext2D>).resetTransform;
  delete (polyfilled as Partial<CanvasRenderingContext2D>).getTransform;

  return polyfilled;
}

const components = (matrix: DOMMatrix) => [
  matrix.a,
  matrix.b,
  matrix.c,
  matrix.d,
  matrix.e,
  matrix.f,
];

test("a context that already has both methods is left alone", () => {
  const context = freshContext();

  expect(typeof context.getTransform).toBe("function");
  expect(polyfillContext(context)).toBe(undefined);
});

test("the polyfill reports the identity matrix to begin with", () => {
  const context = contextNeedingThePolyfill();

  expect(components(context.getTransform())).toEqual([1, 0, 0, 1, 0, 0]);
});

test("translate is tracked", () => {
  const context = contextNeedingThePolyfill();

  context.translate(10, 20);

  expect(components(context.getTransform())).toEqual([1, 0, 0, 1, 10, 20]);
});

test("scale is tracked", () => {
  const context = contextNeedingThePolyfill();

  context.scale(2, 3);

  expect(components(context.getTransform())).toEqual([2, 0, 0, 3, 0, 0]);
});

test("rotate is tracked, converting the canvas's radians to degrees", () => {
  const context = contextNeedingThePolyfill();

  context.rotate(Math.PI / 2);

  const matrix = context.getTransform();
  expect(matrix.a).toBeCloseTo(0, 10);
  expect(matrix.b).toBeCloseTo(1, 10);
  expect(matrix.c).toBeCloseTo(-1, 10);
  expect(matrix.d).toBeCloseTo(0, 10);
});

test("transforms accumulate in the order they were applied", () => {
  const context = contextNeedingThePolyfill();

  context.translate(10, 0);
  context.scale(2, 2);

  expect(components(context.getTransform())).toEqual([2, 0, 0, 2, 10, 0]);
});

test("setTransform replaces whatever was there", () => {
  const context = contextNeedingThePolyfill();

  context.translate(50, 50);
  context.setTransform(1, 0, 0, 1, 5, 5);

  expect(components(context.getTransform())).toEqual([1, 0, 0, 1, 5, 5]);
});

test("transform multiplies onto what was there", () => {
  const context = contextNeedingThePolyfill();

  context.translate(10, 10);
  context.transform(2, 0, 0, 2, 0, 0);

  expect(components(context.getTransform())).toEqual([2, 0, 0, 2, 10, 10]);
});

test("resetTransform puts it back to the identity", () => {
  const context = contextNeedingThePolyfill();

  context.translate(10, 20);
  context.scale(3, 3);
  context.resetTransform();

  expect(components(context.getTransform())).toEqual([1, 0, 0, 1, 0, 0]);
});

test("save and restore wind the transform back", () => {
  const context = contextNeedingThePolyfill();

  context.translate(10, 10);
  context.save();
  context.translate(50, 50);

  expect(components(context.getTransform())).toEqual([1, 0, 0, 1, 60, 60]);

  context.restore();
  expect(components(context.getTransform())).toEqual([1, 0, 0, 1, 10, 10]);
});

test("saves nest", () => {
  const context = contextNeedingThePolyfill();

  context.save();
  context.translate(1, 0);
  context.save();
  context.translate(2, 0);
  context.save();
  context.translate(4, 0);

  expect(context.getTransform().e).toBe(7);

  context.restore();
  expect(context.getTransform().e).toBe(3);

  context.restore();
  expect(context.getTransform().e).toBe(1);

  context.restore();
  expect(context.getTransform().e).toBe(0);
});

test("known quirk: setTransform throws away the saved transform stack", () => {
  const context = contextNeedingThePolyfill();

  context.save();
  context.translate(10, 10);

  // setTransform resets savedMatrices to just the new matrix, so the save that
  // was outstanding is gone and restoring goes back to the wrong place.
  context.setTransform(1, 0, 0, 1, 99, 99);
  context.restore();

  expect(components(context.getTransform())).toEqual([1, 0, 0, 1, 99, 99]);
});

test("a restore with no matching save leaves the transform alone", () => {
  const context = contextNeedingThePolyfill();

  context.translate(10, 10);

  context.restore();
  expect(components(context.getTransform())).toEqual([1, 0, 0, 1, 10, 10]);

  context.restore();
  expect(components(context.getTransform())).toEqual([1, 0, 0, 1, 10, 10]);
});

test("the polyfilled context still draws", () => {
  const context = contextNeedingThePolyfill();

  context.translate(10, 10);
  context.fillStyle = "red";
  context.fillRect(0, 0, 5, 5);

  const [r, g, b] = context.getImageData(12, 12, 1, 1).data;
  expect([r, g, b]).toEqual([255, 0, 0]);

  const [, , , cornerAlpha] = context.getImageData(1, 1, 1, 1).data;
  expect(cornerAlpha).toBe(0);
});
