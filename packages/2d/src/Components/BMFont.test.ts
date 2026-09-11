/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import BMFont from "./BMFont";
import Font from "./Font";
import Preloader from "../Preloader";
import { endGame, startGame } from "./inputTestSetup";
import silver from "../__fixtures__/silver.fnt";

afterEach(endGame);

function startWithFont() {
  let font!: ReturnType<typeof BMFont>;
  let entity!: ReturnType<typeof useChild>;

  startGame(() => {
    entity = useChild(function Subject() {
      useType(Subject);
      font = useNewComponent(() => BMFont(silver));
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

let unusedUrlCount = 0;

/**
 * The same font, but pointed at a page image no earlier test can have loaded,
 * since Image caches by url and test order is not fixed.
 */
function startWithUnloadedFont() {
  unusedUrlCount++;
  const context = blankContext(64, 4);
  context.fillStyle = "red";
  context.fillRect(0, 0, unusedUrlCount, 1);

  let font!: ReturnType<typeof BMFont>;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);
      font = useNewComponent(() =>
        BMFont({ ...silver, pages: [context.canvas.toDataURL()] })
      );
    });
  });

  return font;
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

test("the loader hands over parsed font data with its pages turned into urls", () => {
  expect(silver.info.face).toBe("Silver");
  expect(silver.info.size).toBe(18);
  expect(silver.chars.length).toBeGreaterThan(0);
  expect(silver.pages.length).toBe(1);
  expect(typeof silver.pages[0]).toBe("string");
});

test("a BMFont keeps the data it was given and makes an Image per page", () => {
  const { font } = startWithFont();

  expect(font.data).toBe(silver);
  expect(font.images.length).toBe(silver.pages.length);
  expect(font.images[0].url).toBe(silver.pages[0]);
});

test("getFontSize comes from the font file", () => {
  const { font } = startWithFont();

  expect(font.getFontSize()).toBe(18);
});

test("readyToDraw only becomes true once the page images have loaded", async () => {
  const font = startWithUnloadedFont();

  expect(font.readyToDraw()).toBe(false);

  await Preloader.load();

  expect(font.readyToDraw()).toBe(true);
});

test("measureWidth grows with the amount of text", () => {
  const { font } = startWithFont();

  const short = font.measureWidth("i");
  const long = font.measureWidth("iiiiiiiiii");

  expect(short).toBeGreaterThan(0);
  expect(long).toBeGreaterThan(short);
});

test("measureWidth of nothing is zero", () => {
  const { font } = startWithFont();

  expect(font.measureWidth("")).toBe(0);
});

test("drawing before the pages have loaded puts nothing on the canvas", () => {
  const font = startWithUnloadedFont();
  const context = blankContext(200, 60);

  expect(font.readyToDraw()).toBe(false);
  font.drawText(context, "hello", { x: 0, y: 40 });

  expect(filledPixelCount(context)).toBe(0);
});

test("drawText puts pixels on the canvas once loaded", async () => {
  const { font } = startWithFont();
  await Preloader.load();

  const context = blankContext(200, 60);
  font.drawText(context, "hello", { x: 0, y: 40 });

  expect(filledPixelCount(context)).toBeGreaterThan(0);
});

test("drawText draws nothing for an empty string", async () => {
  const { font } = startWithFont();
  await Preloader.load();

  const context = blankContext(200, 60);
  font.drawText(context, "", { x: 0, y: 40 });

  expect(filledPixelCount(context)).toBe(0);
});

test("x moves where the text lands", async () => {
  const { font } = startWithFont();
  await Preloader.load();

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

  const left = blankContext(200, 60);
  font.drawText(left, "hi", { x: 0, y: 40 });

  const right = blankContext(200, 60);
  font.drawText(right, "hi", { x: 120, y: 40 });

  expect(columnIsEmpty(left, 0, 100)).toBe(false);
  expect(columnIsEmpty(left, 120, 200)).toBe(true);
  expect(columnIsEmpty(right, 0, 100)).toBe(true);
  expect(columnIsEmpty(right, 120, 200)).toBe(false);
});

test("measureText reports vertical metrics that stack up sensibly", async () => {
  const { font } = startWithFont();
  await Preloader.load();

  const measurements = font.measureText("Hello Wg");

  expect(measurements.width).toBeGreaterThan(0);
  expect(measurements.height).toBeGreaterThan(0);
  expect(measurements.baselineToCapLine).toBeGreaterThan(
    measurements.baselineToMeanLine
  );
});

test("a BMFont registers itself as the Entity's Font", () => {
  const { entity } = startWithFont();

  expect(entity.hasComponent(Font)).toBe(true);
  expect(entity.getComponent(Font)!.getFontSize()).toBe(18);
});
