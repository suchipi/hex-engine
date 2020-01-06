import { useType, useNewComponent } from "@hex-engine/core";
import Font, { FontImplementation } from "./Font";

export default function SystemFont({
  name,
  size,
  color = "black",
  align = "left",
}: {
  name: string;
  size: number;
  color?: void | string;
  align?: void | "start" | "end" | "left" | "right" | "center";
}) {
  useType(SystemFont);

  const canvas = document.createElement("canvas");
  const internalContext = canvas.getContext("2d")!;

  const state = {
    name,
    size,
    color,
    align,
  };

  function prepareContext(context: CanvasRenderingContext2D) {
    context.font = `${state.size}px ${state.name}`;
    context.fillStyle = state.color;
    context.textAlign = state.align;
  }

  const api: FontImplementation = {
    drawText({ context, text, x = 0, y = 0 }) {
      prepareContext(context);
      context.fillText(text, x, y);
    },
    measureTextWidth(text) {
      prepareContext(internalContext);
      const metrics = internalContext.measureText(text);
      return metrics.width;
    },
    estimateFontHeight() {
      // No great way to get this :\
      return state.size * 0.75;
    },
  };

  useNewComponent(() => Font(api));

  return {
    ...api,

    get name() {
      return state.name;
    },
    set name(nextValue) {
      state.name = nextValue;
    },
    get size() {
      return state.size;
    },
    set size(nextValue) {
      state.size = nextValue;
    },
    get color() {
      return state.color;
    },
    set color(nextValue) {
      state.color = nextValue;
    },
    get align() {
      return state.align;
    },
    set align(nextValue) {
      state.align = nextValue;
    },
  };
}
