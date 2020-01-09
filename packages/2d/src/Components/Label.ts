import {
  useNewComponent,
  useType,
  useExistingComponentByType,
} from "@hex-engine/core";
import { useUpdate } from "../Canvas";
import BoundingBox from "./BoundingBox";
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

  let hasCustomBounds = false;
  let bounds: Vec2 = useExistingComponentByType(BoundingBox)!;
  if (bounds) {
    hasCustomBounds = true;
  } else {
    bounds = useNewComponent(() => BoundingBox(new Vec2(0, 0)));
  }

  function updateBounds() {
    if (hasCustomBounds) return;

    const width = font.measureTextWidth(state.text);
    const height = font.estimateFontHeight();
    bounds.x = width;
    bounds.y = height;
  }

  updateBounds();
  useUpdate(updateBounds);

  return {
    bounds,
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
        y: y + bounds.y,
      });
    },
    get text() {
      return state.text;
    },
    set text(nextValue) {
      state.text = nextValue;
      updateBounds();
    },
  };
}
