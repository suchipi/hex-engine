/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import FontMetrics, { DrawableFont } from "./FontMetrics";
import SystemFont from "./SystemFont";
import { endGame, startGame } from "./inputTestSetup";

afterEach(endGame);

/** A DrawableFont backed by a real system font, so the measurements are real. */
function drawableFont({
  ready = true,
  size = 40,
  onDrawText,
}: {
  ready?: boolean;
  size?: number;
  onDrawText?: (text: string) => void;
} = {}): { font: DrawableFont; setReady: (value: boolean) => void } {
  const canvas = document.createElement("canvas");
  const measuringContext = canvas.getContext("2d")!;
  let isReady = ready;

  const prepare = (context: CanvasRenderingContext2D) => {
    context.font = `${size}px sans-serif`;
    context.fillStyle = "black";
  };

  return {
    font: {
      readyToDraw: () => isReady,
      getFontSize: () => size,
      measureWidth: (text) => {
        prepare(measuringContext);
        return measuringContext.measureText(text).width;
      },
      drawText: (context, text, options = {}) => {
        if (onDrawText) onDrawText(text);
        prepare(context);
        context.fillText(text, options.x ?? 0, options.y ?? 0);
      },
    },
    setReady: (value: boolean) => {
      isReady = value;
    },
  };
}

function startWithMetrics(font: DrawableFont) {
  let metrics!: ReturnType<typeof FontMetrics>;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);
      metrics = useNewComponent(() => FontMetrics(font));
    });
  });

  return metrics;
}

test("everything measures as zero while the font is not ready to draw", () => {
  const { font } = drawableFont({ ready: false });
  const metrics = startWithMetrics(font);

  expect(metrics.measureText("Hello")).toEqual({
    baselineToMeanLine: 0,
    baselineToCapLine: 0,
    baselineToDescentLine: 0,
    baselineToAscentLine: 0,
    descentLineToAscentLine: 0,
    baselineToCJKBottom: 0,
    baselineToCJKTop: 0,
    CJKTopToCJKBottom: 0,
    width: 0,
    height: 0,
  });
});

test("width comes from the font, and grows with the text", () => {
  const { font } = drawableFont();
  const metrics = startWithMetrics(font);

  const short = metrics.measureText("i").width;
  const long = metrics.measureText("iiiiiiiiii").width;

  expect(short).toBeGreaterThan(0);
  expect(long).toBeGreaterThan(short);
});

test("the vertical measurements stack up the way the names say", () => {
  const { font } = drawableFont();
  const metrics = startWithMetrics(font);

  const measured = metrics.measureText("Hello");

  // Capitals reach higher than lowercase x-height.
  expect(measured.baselineToCapLine).toBeGreaterThan(
    measured.baselineToMeanLine
  );
  // Ascenders are at least as tall as capitals.
  expect(measured.baselineToAscentLine).toBeGreaterThanOrEqual(
    measured.baselineToCapLine
  );
  // Descenders hang below the baseline.
  expect(measured.baselineToDescentLine).toBeGreaterThan(0);
  // And the full span is the two of them together.
  expect(measured.descentLineToAscentLine).toBe(
    measured.baselineToDescentLine + measured.baselineToAscentLine
  );
});

test("CJK measurements are taken as well", () => {
  const { font } = drawableFont();
  const metrics = startWithMetrics(font);

  const measured = metrics.measureText("Hello");

  expect(measured.CJKTopToCJKBottom).toBe(
    measured.baselineToCJKTop + measured.baselineToCJKBottom
  );
  expect(measured.height).toBeGreaterThan(0);
});

test("measuring the same text twice gives the same answer", () => {
  const { font } = drawableFont();
  const metrics = startWithMetrics(font);

  const first = metrics.measureText.withoutMemoization("Hello");
  const second = metrics.measureText.withoutMemoization("Hello");

  expect(second).toEqual(first);
});

test("the vertical measurements do not depend on the text being measured", () => {
  const { font } = drawableFont();
  const metrics = startWithMetrics(font);

  const short = metrics.measureText("i");
  const long = metrics.measureText("something else entirely");

  expect({ ...long, width: 0 }).toEqual({ ...short, width: 0 });
});

test("width still tracks the text, whatever the vertical measurements do", () => {
  const { font } = drawableFont();
  const metrics = startWithMetrics(font);

  const short = metrics.measureText("i");
  const long = metrics.measureText("something else entirely");

  expect(long.width).toBeGreaterThan(short.width);
});

test("a bigger font measures bigger", () => {
  const small = startWithMetrics(drawableFont({ size: 20 }).font).measureText(
    "Hello"
  );
  endGame();
  const large = startWithMetrics(drawableFont({ size: 60 }).font).measureText(
    "Hello"
  );

  expect(large.height).toBeGreaterThan(small.height);
  expect(large.baselineToCapLine).toBeGreaterThan(small.baselineToCapLine);
});

test("measuring the same text twice is served from the cache", () => {
  const drawn: Array<string> = [];
  const { font } = drawableFont({ onDrawText: (text) => drawn.push(text) });
  const metrics = startWithMetrics(font);

  metrics.measureText("Hello");
  const afterFirst = drawn.length;
  expect(afterFirst).toBeGreaterThan(0);

  metrics.measureText("Hello");
  expect(drawn.length).toBe(afterFirst);
});

test("withoutMemoization measures afresh every time", () => {
  const drawn: Array<string> = [];
  const { font } = drawableFont({ onDrawText: (text) => drawn.push(text) });
  const metrics = startWithMetrics(font);

  metrics.measureText("Hello");
  const afterFirst = drawn.length;

  metrics.measureText.withoutMemoization("Hello");
  expect(drawn.length).toBeGreaterThan(afterFirst);
});

test("clearMemoizationCache makes the next measurement measure again", () => {
  const drawn: Array<string> = [];
  const { font } = drawableFont({ onDrawText: (text) => drawn.push(text) });
  const metrics = startWithMetrics(font);

  metrics.measureText("Hello");
  const afterFirst = drawn.length;

  metrics.measureText("Hello");
  expect(drawn.length).toBe(afterFirst);

  metrics.measureText.clearMemoizationCache();
  metrics.measureText("Hello");

  expect(drawn.length).toBeGreaterThan(afterFirst);
});

test("the cache notices when the font becomes ready", () => {
  const { font, setReady } = drawableFont({ ready: false });
  const metrics = startWithMetrics(font);

  expect(metrics.measureText("Hello").width).toBe(0);

  setReady(true);

  // The cache key includes readyToDraw, so the stale zeroes are not reused.
  expect(metrics.measureText("Hello").width).toBeGreaterThan(0);
});

test("a SystemFont's measureText is a FontMetrics measurement", () => {
  let font!: ReturnType<typeof SystemFont>;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);
      font = useNewComponent(() =>
        SystemFont({ name: "sans-serif", size: 40 })
      );
    });
  });

  const measured = font.measureText("Hello");

  expect(measured.width).toBeGreaterThan(0);
  expect(measured.height).toBeGreaterThan(0);
  expect(typeof measured.baselineToCapLine).toBe("number");
});
