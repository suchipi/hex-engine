import { useInspectorHover } from "@hex-engine/inspector";
import { Shape } from "../Models";
import { useDraw } from "../Hooks";

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
      context.strokeStyle = "magenta";
      shape.draw(context, "stroke");
    }
  });
}
