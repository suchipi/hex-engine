import { useType } from "@hex-engine/core";
import { useContext } from "../Hooks";
import { Vec2, TransformMatrix } from "../Models";

export default function DOMElement({ size }: { size: Vec2 }) {
  useType(DOMElement);

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

  element.textContent = "Hi everybody!";
  return {
    element,
    setTransformMatrix: (matrix: TransformMatrix): void => {
      const realMatrix = canvasScaleMatrix().times(matrix);

      element.style.width = size.x + "px";
      element.style.height = size.y + "px";
      element.style.transform = `matrix(${realMatrix.a}, ${realMatrix.b}, ${realMatrix.c}, ${realMatrix.d}, ${realMatrix.e}, ${realMatrix.f})`;
    },
  };
}
