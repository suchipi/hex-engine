import { useType } from "@hex-engine/core";
import { useUpdate } from "../Canvas";
import { FontImplementation } from "./Font";
import { Vec2 } from "../Models";

export default function Label({
  text,
  font,
}: {
  text: string;
  font: FontImplementation;
}) {
  useType(Label);

  const state = {
    text,
  };

  const size = new Vec2(0, 0);

  function updateSize() {
    const width = font.measureTextWidth(state.text);
    const height = font.estimateFontHeight();
    size.x = width;
    size.y = height;
  }

  updateSize();
  useUpdate(updateSize);

  return {
    size,
    drawLabel({
      context,
      x = 0,
      y = 0,
    }: {
      context: CanvasRenderingContext2D;
      x?: number | undefined;
      y?: number | undefined;
    }) {
      font.drawText({
        context,
        text: state.text,
        x: x,
        y: y + size.y,
      });
    },
    get text() {
      return state.text;
    },
    set text(nextValue) {
      state.text = nextValue;
      updateSize();
    },
  };
}
