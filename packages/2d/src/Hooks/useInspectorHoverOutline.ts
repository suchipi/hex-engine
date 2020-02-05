import { useInspectorHover } from "@hex-engine/inspector";
import { Shape } from "../Models";
import { useDraw } from "../Hooks";

/**
 * Sets up the Inspector so that when the current Entity or Component is hovered over,
 * the provided function will be called to get a shape that should be drawn onto the screen.
 *
 * This function does nothing in release builds.
 */
export default function useInspectorHoverOutline(getShape: () => Shape) {
  if (process.env.NODE_ENV === "production") return;

  const { onHoverStart, onHoverEnd } = useInspectorHover();

  let visible = false;
  onHoverStart(() => {
    visible = true;
  });

  onHoverEnd(() => {
    visible = false;
  });

  useDraw((context) => {
    if (visible) {
      const shape = getShape();
      context.lineWidth = 3;
      context.strokeStyle = "#B076C7";
      shape.draw(context, "stroke");
    }
  });
}
