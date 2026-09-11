/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import SystemFont from "./SystemFont";
import TextBox from "./TextBox";
import { Vector } from "../Models";
import { endGame, startGame } from "./inputTestSetup";

afterEach(endGame);

function startWithTextBox(size: Vector, lineHeight?: number) {
  let textBox!: ReturnType<typeof TextBox>;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      const font = useNewComponent(() =>
        SystemFont({ name: "sans-serif", size: 12 })
      );
      textBox = useNewComponent(() => TextBox({ font, size, lineHeight }));
    });
  });

  return textBox;
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

test("short text fits on one line, with nothing left over", () => {
  const textBox = startWithTextBox(new Vector(300, 100), 20);
  const context = blankContext(300, 100);

  const result = textBox.drawText(context, "hello", { x: 0, y: 20 });

  expect(result.didTextFit).toBe(true);
  expect(result.remainingText).toBe("");
  expect(result.printedLines).toEqual(["hello"]);
});

test("text too wide for the box is wrapped onto more lines", () => {
  const textBox = startWithTextBox(new Vector(60, 200), 20);
  const context = blankContext(200, 200);

  const result = textBox.drawText(context, "one two three four five six", {
    x: 0,
    y: 20,
  });

  expect(result.printedLines.length).toBeGreaterThan(1);
  expect(result.printedLines.join(" ")).toContain("one");
});

test("text too tall for the box is cut off and reported as remaining", () => {
  const textBox = startWithTextBox(new Vector(60, 40), 20);
  const context = blankContext(200, 200);

  const result = textBox.drawText(
    context,
    "one two three four five six seven eight nine ten",
    { x: 0, y: 20 }
  );

  expect(result.didTextFit).toBe(false);
  expect(result.remainingText.length).toBeGreaterThan(0);
  expect(result.printedLines.length).toBeGreaterThan(0);
});

test("what was printed and what remains cover the whole input between them", () => {
  const textBox = startWithTextBox(new Vector(60, 40), 20);
  const context = blankContext(200, 200);

  const text = "one two three four five six seven eight";
  const result = textBox.drawText(context, text, { x: 0, y: 20 });

  const words = (value: string) => value.split(/\s+/).filter(Boolean);

  expect([
    ...words(result.printedLines.join(" ")),
    ...words(result.remainingText),
  ]).toEqual(words(text));
});

test("drawing puts pixels on the canvas", () => {
  const textBox = startWithTextBox(new Vector(300, 100), 20);
  const context = blankContext(300, 100);

  textBox.drawText(context, "hello there", { x: 0, y: 20 });

  expect(filledPixelCount(context)).toBeGreaterThan(0);
});

test("empty text prints nothing and fits", () => {
  const textBox = startWithTextBox(new Vector(300, 100), 20);
  const context = blankContext(300, 100);

  const result = textBox.drawText(context, "", { x: 0, y: 20 });

  expect(result.didTextFit).toBe(true);
  expect(filledPixelCount(context)).toBe(0);
});

test("a line break in the text starts a new line", () => {
  const textBox = startWithTextBox(new Vector(300, 200), 20);
  const context = blankContext(300, 200);

  const result = textBox.drawText(context, "first\nsecond", { x: 0, y: 20 });

  expect(result.printedLines.length).toBe(2);
});

test("nothing is drawn while the font is not ready", () => {
  let textBox!: ReturnType<typeof TextBox>;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      const font = useNewComponent(() =>
        SystemFont({ name: "sans-serif", size: 12 })
      );
      textBox = useNewComponent(() =>
        TextBox({
          // Spelled out rather than spread, because a Component's forwarded
          // properties are non-enumerable and so do not survive a spread.
          font: {
            readyToDraw: () => false,
            drawText: (...args) => font.drawText(...args),
            getFontSize: () => font.getFontSize(),
            measureWidth: (text) => font.measureWidth(text),
            measureText: font.measureText,
          },
          size: new Vector(300, 100),
          lineHeight: 20,
        })
      );
    });
  });

  const context = blankContext(300, 100);
  const result = textBox.drawText(context, "hello", { x: 0, y: 20 });

  expect(result).toEqual({
    didTextFit: false,
    remainingText: "hello",
    printedLines: [],
  });
  expect(filledPixelCount(context)).toBe(0);
});

test("lineHeight is worked out from the font when it is not given", () => {
  const withoutLineHeight = startWithTextBox(new Vector(60, 200));
  const context = blankContext(200, 200);

  const result = withoutLineHeight.drawText(context, "one two three four", {
    x: 0,
    y: 20,
  });

  expect(result.printedLines.length).toBeGreaterThan(0);
});

test("a taller box fits more lines than a short one", () => {
  const context = blankContext(200, 400);
  const text = "one two three four five six seven eight nine ten";

  const short = startWithTextBox(new Vector(60, 40), 20).drawText(
    context,
    text,
    { x: 0, y: 20 }
  );
  endGame();

  const tall = startWithTextBox(new Vector(60, 200), 20).drawText(
    context,
    text,
    { x: 0, y: 20 }
  );

  expect(tall.printedLines.length).toBeGreaterThan(short.printedLines.length);
});
