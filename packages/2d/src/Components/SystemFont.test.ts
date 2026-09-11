/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import Font from "./Font";
import SystemFont from "./SystemFont";
import { endGame, startGame } from "./inputTestSetup";

afterEach(endGame);

function startWithFont(options: Parameters<typeof SystemFont>[0]) {
  let font!: ReturnType<typeof SystemFont>;
  let entity!: ReturnType<typeof useChild>;

  startGame(() => {
    entity = useChild(function Subject() {
      useType(Subject);
      font = useNewComponent(() => SystemFont(options));
    });
  });

  return { font, entity };
}

function blankContext(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext("2d")!;
}

function filledPixelCount(context: CanvasRenderingContext2D) {
  const data = context.getImageData(
    0,
    0,
    context.canvas.width,
    context.canvas.height
  ).data;

  let count = 0;
  for (let index = 3; index < data.length; index += 4) {
    if (data[index] > 0) count++;
  }
  return count;
}

test("a system font is always ready to draw", () => {
  const { font } = startWithFont({ name: "sans-serif", size: 12 });

  expect(font.readyToDraw()).toBe(true);
});

test("getFontSize reports the size it was given", () => {
  const { font } = startWithFont({ name: "sans-serif", size: 24 });

  expect(font.getFontSize()).toBe(24);
});

test("the size can be changed afterward", () => {
  const { font } = startWithFont({ name: "sans-serif", size: 12 });

  font.size = 30;

  expect(font.getFontSize()).toBe(30);
});

test("measureWidth grows with the amount of text", () => {
  const { font } = startWithFont({ name: "sans-serif", size: 16 });

  const short = font.measureWidth("i");
  const long = font.measureWidth("iiiiiiiiii");

  expect(short).toBeGreaterThan(0);
  expect(long).toBeGreaterThan(short);
});

test("measureWidth of nothing is zero", () => {
  const { font } = startWithFont({ name: "sans-serif", size: 16 });

  expect(font.measureWidth("")).toBe(0);
});

test("measureWidth grows with the font size", () => {
  const { font } = startWithFont({ name: "sans-serif", size: 10 });

  const atTen = font.measureWidth("hello");
  font.size = 40;
  const atForty = font.measureWidth("hello");

  expect(atForty).toBeGreaterThan(atTen);
});

test("drawText puts pixels on the canvas", () => {
  const { font } = startWithFont({ name: "sans-serif", size: 20 });
  const context = blankContext(200, 60);

  expect(filledPixelCount(context)).toBe(0);

  font.drawText(context, "hello", { x: 10, y: 40 });

  expect(filledPixelCount(context)).toBeGreaterThan(0);
});

test("drawText draws nothing for an empty string", () => {
  const { font } = startWithFont({ name: "sans-serif", size: 20 });
  const context = blankContext(200, 60);

  font.drawText(context, "", { x: 10, y: 40 });

  expect(filledPixelCount(context)).toBe(0);
});

test("x and y move where the text lands", () => {
  const { font } = startWithFont({ name: "sans-serif", size: 20 });

  const left = blankContext(200, 60);
  font.drawText(left, "hi", { x: 0, y: 40 });

  const right = blankContext(200, 60);
  font.drawText(right, "hi", { x: 100, y: 40 });

  const columnIsEmpty = (
    context: CanvasRenderingContext2D,
    fromX: number,
    toX: number
  ) => {
    const data = context.getImageData(fromX, 0, toX - fromX, 60).data;
    for (let index = 3; index < data.length; index += 4) {
      if (data[index] > 0) return false;
    }
    return true;
  };

  expect(columnIsEmpty(left, 0, 100)).toBe(false);
  expect(columnIsEmpty(left, 100, 200)).toBe(true);
  expect(columnIsEmpty(right, 0, 100)).toBe(true);
  expect(columnIsEmpty(right, 100, 200)).toBe(false);
});

test("drawText puts the context's font and colour back to what it was asked for", () => {
  const { font } = startWithFont({
    name: "sans-serif",
    size: 20,
    color: "red",
  });
  const context = blankContext(200, 60);

  context.textBaseline = "middle";
  font.drawText(context, "hi", { x: 0, y: 20, baseline: "top" });

  // The baseline is restored afterward, but the font and colour are left set.
  expect(context.textBaseline).toBe("middle");
  expect(context.fillStyle).toBe("#ff0000");
  expect(context.font).toContain("20px");
});

test("the baseline option moves the text vertically", () => {
  const { font } = startWithFont({ name: "sans-serif", size: 20 });

  const fromTop = blankContext(100, 60);
  font.drawText(fromTop, "hi", { x: 0, y: 0, baseline: "top" });

  const fromBottom = blankContext(100, 60);
  font.drawText(fromBottom, "hi", { x: 0, y: 0, baseline: "bottom" });

  // Drawn from the top at y=0 the text is on the canvas; from the bottom it is
  // above it.
  expect(filledPixelCount(fromTop)).toBeGreaterThan(0);
  expect(filledPixelCount(fromBottom)).toBe(0);
});

test("measureText reports vertical metrics that stack up sensibly", () => {
  const { font } = startWithFont({ name: "sans-serif", size: 40 });

  const measurements = font.measureText("Hello Wg");

  expect(measurements.width).toBeGreaterThan(0);
  expect(measurements.height).toBeGreaterThan(0);
  expect(measurements.baselineToCapLine).toBeGreaterThan(
    measurements.baselineToMeanLine
  );
  expect(measurements.descentLineToAscentLine).toBeGreaterThan(
    measurements.baselineToAscentLine
  );
});

test("a SystemFont registers itself as the Entity's Font", () => {
  const { entity } = startWithFont({ name: "sans-serif", size: 12 });

  expect(entity.hasComponent(Font)).toBe(true);
  expect(entity.getComponent(Font)!.getFontSize()).toBe(12);
});
