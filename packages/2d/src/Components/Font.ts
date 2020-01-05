import { useType } from "@hex-engine/core";

export type FontImplementation = {
  drawText(options: {
    context: CanvasRenderingContext2D;
    text: string;
    x?: number | void;
    y?: number | void;
  }): void;
  measureTextWidth(options: {
    context: CanvasRenderingContext2D;
    text: string;
  }): number;
};

export default function Font(impl: FontImplementation) {
  useType(Font);
  return impl;
}
