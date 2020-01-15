import { useType, useEntity } from "@hex-engine/core";
import {
  useContext,
  useEntityTransforms,
  useDraw,
  useInspectorHoverOutline,
} from "../Hooks";
import { Vec2, TransformMatrix } from "../Models";
import Origin from "./Origin";

export default function DOMElement({
  size,
  noInspectorOutline,
}: {
  size: Vec2;
  noInspectorOutline?: boolean;
}) {
  useType(DOMElement);

  if (!noInspectorOutline) {
    useInspectorHoverOutline(size);
  }

  const element = document.createElement("div");
  element.style.position = "absolute";
  element.style.top = "0";
  element.style.left = "0";

  const canvas = useContext().canvas;
  if (canvas.parentElement) {
    canvas.parentElement.appendChild(element);
  } else {
    throw new Error(
      "Could not append element for DOMElement component to canvas parent, because canvas had no parent"
    );
  }

  function canvasScaleMatrix() {
    const canvas = useContext().canvas;

    const matrix = new TransformMatrix();
    const scaleX = parseFloat(canvas.style.width) / canvas.width;
    const scaleY = parseFloat(canvas.style.height) / canvas.height;

    return matrix.scale(scaleX, scaleY, 0, 0);
  }

  const transforms = useEntityTransforms();

  const state = {
    element,
    size,
  };

  useDraw(() => {
    const realMatrix = canvasScaleMatrix().times(transforms.asMatrix());

    element.style.width = size.x + "px";
    element.style.height = size.y + "px";

    const origin = useEntity().getComponent(Origin);
    element.style.transformOrigin = origin
      ? `${origin.x}px ${origin.y}px`
      : "top left";
    element.style.transform = `matrix(${realMatrix.a}, ${realMatrix.b}, ${realMatrix.c}, ${realMatrix.d}, ${realMatrix.e}, ${realMatrix.f})`;
  });

  return state;
}
