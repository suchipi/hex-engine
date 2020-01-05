import { useType, useNewComponent } from "@hex-engine/core";
import Font, { FontImplementation } from "./Font";

export default function SystemFont({
  name,
  size,
  color = "black",
  align = "left",
}: {
  name: string;
  size: string | number;
  color?: void | string;
  align?: void | "start" | "end" | "left" | "right" | "center";
}) {
  useType(SystemFont);

  const state = {
    name,
    size,
    color,
    align,
  };

  function prepareContext(context: CanvasRenderingContext2D) {
    context.font =
      (typeof state.size === "number" ? `${state.size}px` : state.size) +
      " " +
      state.name;

    context.fillStyle = state.color;
    context.textAlign = state.align;
  }

  const api: FontImplementation = {
    drawText({ context, text, x = 0, y = 0 }) {
      prepareContext(context);
      context.fillText(text, x, y);
    },
    measureTextWidth({ context, text }) {
      prepareContext(context);
      const metrics = context.measureText(text);
      return metrics.width;
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
