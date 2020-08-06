import { useType } from "@hex-engine/core";
import { useUpdate } from "../Hooks";
import { FontImplementation } from "./Font";
import { Vector } from "../Models";

/** This Component renders some text using the provided Font Component (either a Font, BMFont, or SystemFont). */
export default function Label({
  text = "",
  font,
}: {
  /** The text to render. */
  text?: string;
  /** The font to use. */
  font: FontImplementation;
}) {
  useType(Label);

  const state = {
    text,
  };

  const size = new Vector(0, 0);

  function updateSize() {
    const metrics = font.measureText(state.text);
    size.x = metrics.width;
    size.y = metrics.height;
  }

  updateSize();
  useUpdate(updateSize);

  return {
    /** The amount of space that the text will take up, when drawn. */
    size,

    /** Draws the text into the context. */
    draw(
      context: CanvasRenderingContext2D,
      {
        x = 0,
        y = 0,
        baseline = undefined,
      }: {
        x?: number | undefined;
        y?: number | undefined;
        baseline?: CanvasTextBaseline;
      } = {}
    ) {
      if (!font.readyToDraw()) return;
      font.drawText(context, state.text, { x, y, baseline });
    },

    /** The text to render. You can change this to change what to render. */
    get text() {
      return state.text;
    },
    set text(nextValue) {
      state.text = nextValue;
      updateSize();
    },
  };
}
