import { useType, useNewComponent } from "@hex-engine/core";
import Font, { FontImplementation } from "./Font";
import FontMetrics, { DrawableFont } from "./FontMetrics";

/** This Component uses an installed font on the system to render text into the canvas. */
export default function SystemFont({
  name,
  size,
  color = "black",
}: {
  name: string;
  size: number;
  color?: void | string | CanvasGradient;
}) {
  useType(SystemFont);

  const canvas = document.createElement("canvas");
  const internalContext = canvas.getContext("2d")!;

  const state = {
    name,
    size,
    color,
  };
  state.size = size;

  function prepareContext(context: CanvasRenderingContext2D) {
    context.font = `${state.size}px ${state.name}`;
    context.fillStyle = state.color;
  }

  const baseApi: DrawableFont = {
    readyToDraw() {
      return true;
    },
    drawText(context, text, options = {}) {
      prepareContext(context);
      const oldBaseline = context.textBaseline;
      if (options.baseline) {
        context.textBaseline = options.baseline;
      }
      context.fillText(text, options.x ?? 0, options.y ?? 0);
      context.textBaseline = oldBaseline;
    },
    getFontSize() {
      return state.size;
    },
    measureWidth(text) {
      prepareContext(internalContext);
      const textMetrics = internalContext.measureText(text);
      return textMetrics.width;
    },
  };

  const fontMetrics = useNewComponent(() => FontMetrics(baseApi));

  const fontApi: FontImplementation = {
    ...baseApi,
    measureText: fontMetrics.measureText,
  };

  useNewComponent(() => Font(fontApi));

  return {
    ...fontApi,

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
  };
}
