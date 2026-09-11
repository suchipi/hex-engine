/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import ImageFilter from "./ImageFilter";
import { endGame, startGame } from "./inputTestSetup";

afterEach(endGame);

function startWithFilter(filter: (data: ImageData) => void) {
  let imageFilter!: ReturnType<typeof ImageFilter>;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);
      imageFilter = useNewComponent(() => ImageFilter(filter));
    });
  });

  return imageFilter;
}

function contextFilledWith(color: string, width = 4, height = 4) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d")!;
  context.fillStyle = color;
  context.fillRect(0, 0, width, height);
  return context;
}

function firstPixel(context: CanvasRenderingContext2D) {
  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
  return { r, g, b, a };
}

const swapRedAndBlue = (data: ImageData) => {
  for (let index = 0; index < data.data.length; index += 4) {
    const red = data.data[index];
    data.data[index] = data.data[index + 2];
    data.data[index + 2] = red;
  }
};

test("the filter's changes come out on the output context", () => {
  const filter = startWithFilter(swapRedAndBlue);

  const input = contextFilledWith("red");
  const output = contextFilledWith("rgba(0, 0, 0, 0)");

  filter.apply(input, output);

  expect(firstPixel(output)).toEqual({ r: 0, g: 0, b: 255, a: 255 });
});

test("known quirk: apply also writes the filtered pixels back into the input", () => {
  const filter = startWithFilter(swapRedAndBlue);

  const input = contextFilledWith("red");
  const output = contextFilledWith("rgba(0, 0, 0, 0)");

  filter.apply(input, output);

  // apply putImageDatas into the input before drawing it onto the output, so
  // the context it read from is modified as a side effect.
  expect(firstPixel(input)).toEqual({ r: 0, g: 0, b: 255, a: 255 });
});

test("applying the same filter twice stacks the changes up", () => {
  const filter = startWithFilter(swapRedAndBlue);

  const input = contextFilledWith("red");
  const output = contextFilledWith("rgba(0, 0, 0, 0)");

  filter.apply(input, output);
  filter.apply(input, output);

  // Swapped back again, because the first apply left the input swapped.
  expect(firstPixel(output)).toEqual({ r: 255, g: 0, b: 0, a: 255 });
});

test("a filter that changes nothing leaves the pixels alone", () => {
  const filter = startWithFilter(() => {});

  const input = contextFilledWith("rgb(1, 2, 3)");
  const output = contextFilledWith("rgba(0, 0, 0, 0)");

  filter.apply(input, output);

  expect(firstPixel(output)).toEqual({ r: 1, g: 2, b: 3, a: 255 });
});

test("the filter is handed the whole input canvas", () => {
  let seen: null | { width: number; height: number } = null;

  const filter = startWithFilter((data) => {
    seen = { width: data.width, height: data.height };
  });

  filter.apply(contextFilledWith("red", 7, 5), contextFilledWith("red", 7, 5));

  expect(seen).toEqual({ width: 7, height: 5 });
});

test("the output keeps its own size, and the input is drawn at its top-left", () => {
  const filter = startWithFilter(() => {});

  const input = contextFilledWith("red", 2, 2);
  const output = contextFilledWith("rgba(0, 0, 0, 0)", 4, 4);

  filter.apply(input, output);

  expect(firstPixel(output)).toEqual({ r: 255, g: 0, b: 0, a: 255 });

  const [, , , cornerAlpha] = output.getImageData(3, 3, 1, 1).data;
  expect(cornerAlpha).toBe(0);
});
