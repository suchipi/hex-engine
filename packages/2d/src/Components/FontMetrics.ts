import mem from "mem";
import { useType } from "@hex-engine/core";
import { useFilledPixelBounds } from "../Hooks";

export type DrawableFont = {
  readyToDraw(): boolean;
  drawText(
    context: CanvasRenderingContext2D,
    text: string,
    options?: {
      x?: number | undefined;
      y?: number | undefined;
      baseline?: CanvasTextBaseline;
    }
  ): void;
  getFontSize(): number;
  measureWidth(text: string): number;
};

// See FontMetrics-ReferenceImage.png
export type VerticalFontMeasurements = {
  baselineToMeanLine: number;
  baselineToCapLine: number;
  baselineToDescentLine: number;
  baselineToAscentLine: number;
  descentLineToAscentLine: number;
  baselineToCJKTop: number;
  baselineToCJKBottom: number;
  CJKTopToCJKBottom: number;
  height: number;
};

/**
 * This Component measures various characters using the specified font in order to
 * provide a function which can accurately predict the render size of text on the page.
 *
 * It is rarely used directly; instead, use `BMFont` or `SystemFont`.
 */
export default function FontMetrics(impl: DrawableFont) {
  useType(FontMetrics);

  const canvas = document.createElement("canvas");
  canvas.width = impl.getFontSize() * 26;
  canvas.height = impl.getFontSize() * 3;

  const context = canvas.getContext("2d")!;
  if (context == null) {
    throw new Error("Could not get 2d context from canvas");
  }

  function getMeasurements(): VerticalFontMeasurements {
    if (!impl.readyToDraw()) {
      return {
        baselineToMeanLine: 0,
        baselineToCapLine: 0,
        baselineToDescentLine: 0,
        baselineToAscentLine: 0,
        descentLineToAscentLine: 0,
        baselineToCJKTop: 0,
        baselineToCJKBottom: 0,
        CJKTopToCJKBottom: 0,
        height: 0,
      };
    }

    context.fillStyle = "black";
    const size = impl.getFontSize();

    impl.drawText(context, "acemnorsuvwxz", { x: 0, y: size });
    let filledBounds = useFilledPixelBounds(context);
    const baseline = filledBounds.maxY;
    const meanLine = filledBounds.minY;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    impl.drawText(context, "gjypq", { x: 0, y: size });
    filledBounds = useFilledPixelBounds(context);
    const descentLine = filledBounds.maxY;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    impl.drawText(context, "fhijklt", { x: 0, y: size });
    filledBounds = useFilledPixelBounds(context);
    const ascendersLine = filledBounds.minY;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    impl.drawText(context, "ABCDEFGHIJKLMNOPQRSTUVWXYZ", {
      x: 0,
      y: size,
    });
    filledBounds = useFilledPixelBounds(context);
    const capLine = filledBounds.minY;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    const ascentLine = Math.min(ascendersLine, capLine);

    impl.drawText(context, "你好。こんにちは。안녕하세요.", {
      x: 0,
      y: size,
    });
    filledBounds = useFilledPixelBounds(context);
    const CJKTopLine = filledBounds.minY;
    const CJKBottomLine = filledBounds.maxY;

    return {
      baselineToMeanLine: baseline - meanLine,
      baselineToCapLine: baseline - capLine,
      baselineToDescentLine: descentLine - baseline,
      baselineToAscentLine: baseline - ascentLine,
      descentLineToAscentLine: descentLine - ascentLine,
      baselineToCJKBottom: CJKBottomLine - baseline,
      baselineToCJKTop: baseline - CJKTopLine,
      CJKTopToCJKBottom: CJKBottomLine - CJKTopLine,
      height:
        Math.max(descentLine, CJKBottomLine) - Math.min(ascentLine, CJKTopLine),
    };
  }

  return {
    measureText: mem(
      (text: string): VerticalFontMeasurements & { width: number } => {
        if (!impl.readyToDraw()) {
          return {
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
          };
        }

        const width = impl.measureWidth(text);
        const metrics = getMeasurements();

        return {
          ...metrics,
          width,
        };
      },
      {
        cacheKey: (args) => {
          return `${impl.readyToDraw()}${impl.getFontSize()}${args[0]}`;
        },
      }
    ),
  };
}
