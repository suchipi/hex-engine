/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import Label from "./Label";
import SystemFont from "./SystemFont";
import { endGame, startGame, step, xy } from "./inputTestSetup";

afterEach(endGame);

function startWithLabel(text: string = "") {
  let label!: ReturnType<typeof Label>;
  let font!: ReturnType<typeof SystemFont>;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);
      font = useNewComponent(() =>
        SystemFont({ name: "sans-serif", size: 20 })
      );
      label = useNewComponent(() => Label({ text, font }));
    });
  });

  return { label, font };
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

test("text defaults to nothing", () => {
  expect(startWithLabel().label.text).toBe("");
});

test("text is whatever it was created with, and can be changed", () => {
  const { label } = startWithLabel("hello");

  expect(label.text).toBe("hello");

  label.text = "goodbye";
  expect(label.text).toBe("goodbye");
});

test("size measures the text through the font", () => {
  const { label } = startWithLabel("hello");

  expect(label.size.x).toBeGreaterThan(0);
  expect(label.size.y).toBeGreaterThan(0);
});

test("size updates as soon as the text is set", () => {
  const { label } = startWithLabel("i");
  const short = xy(label.size);

  label.text = "iiiiiiiiiiiiiiii";

  expect(label.size.x).toBeGreaterThan(short.x);
});

test("the same size Vector is kept up to date rather than replaced", () => {
  const { label } = startWithLabel("hello");
  const original = label.size;

  label.text = "a much longer piece of text";

  expect(label.size).toBe(original);
});

test("size follows a change to the font, once a frame has run", () => {
  const { label, font } = startWithLabel("hello");
  const atTwenty = xy(label.size);

  font.size = 60;
  step();

  expect(label.size.x).toBeGreaterThan(atTwenty.x);
});

test("drawing puts the text on the canvas", () => {
  const { label } = startWithLabel("hello");
  const context = blankContext(300, 80);

  label.draw(context, { x: 10, y: 50 });

  expect(filledPixelCount(context)).toBeGreaterThan(0);
});

test("drawing empty text puts nothing on the canvas", () => {
  const { label } = startWithLabel("");
  const context = blankContext(300, 80);

  label.draw(context, { x: 10, y: 50 });

  expect(filledPixelCount(context)).toBe(0);
});

test("nothing is drawn while the font is not ready", () => {
  let label!: ReturnType<typeof Label>;
  let ready = false;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      const font = useNewComponent(() =>
        SystemFont({ name: "sans-serif", size: 20 })
      );
      label = useNewComponent(() =>
        Label({
          text: "hello",
          // Spelled out rather than spread, because a Component's forwarded
          // properties are non-enumerable and so do not survive a spread.
          font: {
            readyToDraw: () => ready,
            drawText: (...args) => font.drawText(...args),
            getFontSize: () => font.getFontSize(),
            measureWidth: (text) => font.measureWidth(text),
            measureText: font.measureText,
          },
        })
      );
    });
  });

  const context = blankContext(300, 80);
  label.draw(context, { x: 10, y: 50 });
  expect(filledPixelCount(context)).toBe(0);

  ready = true;
  label.draw(context, { x: 10, y: 50 });
  expect(filledPixelCount(context)).toBeGreaterThan(0);
});

test("x and y move where the text lands", () => {
  const { label } = startWithLabel("hi");

  const columnIsEmpty = (
    context: CanvasRenderingContext2D,
    fromX: number,
    toX: number
  ) => {
    const data = context.getImageData(fromX, 0, toX - fromX, 80).data;
    for (let index = 3; index < data.length; index += 4) {
      if (data[index] > 0) return false;
    }
    return true;
  };

  const left = blankContext(300, 80);
  label.draw(left, { x: 0, y: 50 });

  const right = blankContext(300, 80);
  label.draw(right, { x: 150, y: 50 });

  expect(columnIsEmpty(left, 0, 100)).toBe(false);
  expect(columnIsEmpty(left, 150, 300)).toBe(true);
  expect(columnIsEmpty(right, 0, 100)).toBe(true);
  expect(columnIsEmpty(right, 150, 300)).toBe(false);
});
