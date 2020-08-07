import {
  useRootEntity,
  useType,
  useCurrentComponent,
  useCallbackAsCurrent,
  useNewRootComponent,
} from "@hex-engine/core";
import { useUpdate } from ".";
import useWindowSize from "./useWindowSize";
import useContext from "./useContext";
import { Vector } from "../Models";

function StorageForCanvasSize(): {
  listeners: Set<() => void>;
  size: Vector;
  resizeCanvas: (options: {
    realWidth: number | string;
    realHeight: number | string;
    pixelWidth: number;
    pixelHeight: number;
  }) => void;
} {
  useType(StorageForCanvasSize);

  const context = useContext();

  const listeners = new Set<() => void>();
  const size = new Vector(context.canvas.width, context.canvas.height);

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
      listeners.forEach((callback) => callback());
    }
  });

  function resizeCanvas({
    realWidth,
    realHeight,
    pixelWidth,
    pixelHeight,
  }: {
    realWidth: number | string;
    realHeight: number | string;
    pixelWidth: number;
    pixelHeight: number;
  }) {
    context.canvas.width = pixelWidth;
    context.canvas.height = pixelHeight;
    context.canvas.style.width =
      typeof realWidth === "number" ? realWidth + "px" : realWidth;
    context.canvas.style.height =
      typeof realHeight === "number" ? realHeight + "px" : realHeight;

    size.x = pixelWidth;
    size.y = pixelHeight;

    listeners.forEach((callback) => callback());
  }

  return {
    listeners,
    size,
    resizeCanvas,
  };
}

/**
 * Returns an object with three properties on it:
 * - `canvasSize: Vector`: A Vector that will get mutated such that it always equals the current canvas size
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
  const storage =
    useRootEntity().getComponent(StorageForCanvasSize) ||
    useNewRootComponent(StorageForCanvasSize);

  return {
    canvasSize: storage.size,
    onCanvasResize: (callback: () => void) => {
      const component = useCurrentComponent();
      const wrapped = useCallbackAsCurrent(callback);
      storage.listeners.add(() => {
        if (component.isEnabled) {
          wrapped();
        }
      });
    },
    resizeCanvas: storage.resizeCanvas,
  };
}
