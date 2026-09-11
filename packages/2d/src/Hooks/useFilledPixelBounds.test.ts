/// <reference types="@test-it/core/globals" />
import useFilledPixelBounds from "./useFilledPixelBounds";

function blankContext(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext("2d")!;
}

test("a single filled pixel bounds to itself", () => {
  const context = blankContext(10, 10);
  context.fillStyle = "red";
  context.fillRect(3, 4, 1, 1);

  expect(useFilledPixelBounds(context)).toEqual({
    minX: 3,
    maxX: 3,
    minY: 4,
    maxY: 4,
  });
});

test("a filled rectangle bounds to its edges", () => {
  const context = blankContext(20, 20);
  context.fillStyle = "red";
  context.fillRect(5, 6, 4, 3);

  expect(useFilledPixelBounds(context)).toEqual({
    minX: 5,
    maxX: 8,
    minY: 6,
    maxY: 8,
  });
});

test("the bounds cover every filled pixel, however they are scattered", () => {
  const context = blankContext(20, 20);
  context.fillStyle = "red";
  context.fillRect(2, 15, 1, 1);
  context.fillRect(17, 3, 1, 1);

  expect(useFilledPixelBounds(context)).toEqual({
    minX: 2,
    maxX: 17,
    minY: 3,
    maxY: 15,
  });
});

test("a fully filled canvas bounds to the whole canvas", () => {
  const context = blankContext(6, 4);
  context.fillStyle = "red";
  context.fillRect(0, 0, 6, 4);

  expect(useFilledPixelBounds(context)).toEqual({
    minX: 0,
    maxX: 5,
    minY: 0,
    maxY: 3,
  });
});

test("colour does not matter, only that a pixel is not transparent", () => {
  const context = blankContext(10, 10);
  context.fillStyle = "rgba(0, 0, 0, 0.01)";
  context.fillRect(4, 4, 2, 2);

  expect(useFilledPixelBounds(context)).toEqual({
    minX: 4,
    maxX: 5,
    minY: 4,
    maxY: 5,
  });
});

test("a fully transparent fill counts as nothing being there", () => {
  const context = blankContext(10, 10);
  context.fillStyle = "rgba(255, 0, 0, 0)";
  context.fillRect(0, 0, 10, 10);

  expect(() => useFilledPixelBounds(context)).toThrowError(/no filled pixels/);
});

test("an empty canvas throws rather than returning an empty box", () => {
  expect(() => useFilledPixelBounds(blankContext(10, 10))).toThrowError(
    /no filled pixels/
  );
});

test("a single filled pixel at the very top-left is still found", () => {
  const context = blankContext(10, 10);
  context.fillStyle = "red";
  context.fillRect(0, 0, 1, 1);

  expect(useFilledPixelBounds(context)).toEqual({
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
  });
});
