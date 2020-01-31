import { useListenerAccumulator, useRootEntity } from "@hex-engine/core";
import { useUpdate } from ".";
import useContext from "./useContext";
import useBackstage from "./useBackstage";
import useWindowSize from "./useWindowSize";
import { Point } from "../Models";

const ON_CANVAS_RESIZE = Symbol("ON_CANVAS_RESIZE");
const CANVAS_SIZE = Symbol("CANVAS_SIZE");

/**
 * Returns an object with three properties on it:
 * - `canvasSize: Point`: A Point that will get mutated such that it always equals the current canvas size
 * - `onCanvasResize(() => void): void`: A function that lets you register
 * a function to be run every time the canvas size changes.
 * - `resizeCanvas: ({
 *      realWidth: number | string,
 *      realHeight: number| string,
 *      pixelWidth: number,
 *      pixelHeight: number
 *    }) => void`: A function that resizes the canvas.
 */
export default function useCanvasSize() {
  const context = useContext();
  const backstage = useBackstage();

  const resizeListeners = useListenerAccumulator<() => void>(
    useRootEntity().stateAccumulator(ON_CANVAS_RESIZE)
  );
  const sizeState = useRootEntity().stateAccumulator<Point>(CANVAS_SIZE);

  let size: Point;
  if (sizeState.all().length > 0) {
    size = sizeState.all()[0];
  } else {
    size = new Point(context.canvas.width, context.canvas.height);
    sizeState.add(size);

    let changePending = false;
    useWindowSize().onWindowResize(() => {
      if (context.canvas.width !== size.x) {
        size.x = context.canvas.width;
        changePending = true;
      }
      if (context.canvas.height !== size.y) {
        size.y = context.canvas.height;
        changePending = true;
      }
    });

    useUpdate(() => {
      if (changePending) {
        changePending = false;
        resizeListeners.callListeners();
      }
    });
  }

  return {
    canvasSize: size,
    onCanvasResize: resizeListeners.addListener,
    resizeCanvas: ({
      realWidth,
      realHeight,
      pixelWidth,
      pixelHeight,
    }: {
      realWidth: number | string;
      realHeight: number | string;
      pixelWidth: number;
      pixelHeight: number;
    }) => {
      context.canvas.width = pixelWidth;
      context.canvas.height = pixelHeight;
      context.canvas.style.width =
        typeof realWidth === "number" ? realWidth + "px" : realWidth;
      context.canvas.style.height =
        typeof realHeight === "number" ? realHeight + "px" : realHeight;

      backstage.canvas.width = pixelWidth;
      backstage.canvas.height = pixelHeight;

      size.x = pixelWidth;
      size.y = pixelHeight;

      resizeListeners.callListeners();
    },
  };
}
