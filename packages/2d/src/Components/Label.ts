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
    const metrics = font.measureText(state.text);
    size.x = metrics.width;
    size.y = metrics.height + metrics.descender;
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
      if (!font.readyToDraw()) return;

      font.drawText({
        context,
        text: state.text,
        x,
        y,
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
