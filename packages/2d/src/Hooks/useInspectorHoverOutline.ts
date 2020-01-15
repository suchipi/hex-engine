import { useNewComponent } from "@hex-engine/core";
import { useInspectorHover } from "@hex-engine/inspector";
import { DOMElement } from "../Components";
import { Point } from "../Models";
import { useDraw } from "../Hooks";

export default function useInspectorHoverOutline(size: Point) {
  if (process.env.NODE_ENV === "production") return;

  const { element } = useNewComponent(() =>
    DOMElement({ size, noInspectorOutline: true })
  );
  element.id = "inspector-hover";

  element.style.transition = "all 0.2s ease-in-out";
  element.style.pointerEvents = "none";

  const { onHoverStart, onHoverEnd } = useInspectorHover();

  let visible = false;
  onHoverStart(() => {
    visible = true;
  });

  onHoverEnd(() => {
    visible = false;
  });

  useDraw(() => {
    if (visible) {
      element.style.outlineStyle = "auto";
      element.style.outlineColor = "magenta";
    } else {
      element.style.outlineStyle = "";
      element.style.outlineColor = "";
    }
  });
}
