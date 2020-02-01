import { useRootEntity, useListenerAccumulator } from "@hex-engine/core";
import { useUpdate } from ".";
import { Vector } from "../Models";

const ON_WINDOW_RESIZE = Symbol("ON_WINDOW_RESIZE");
const WINDOW_SIZE = Symbol("WINDOW_SIZE");

/**
 * Returns an object with two properties on it:
 * - `windowSize: Vector`: A Vector that will get mutated such that it always equals the window size
 * - `onWindowResize(() => void): void`: A function that lets you register
 * a function to be run every time the window size changes.
 */
export default function useWindowSize() {
  const resizeListeners = useListenerAccumulator<() => void>(
    useRootEntity().stateAccumulator(ON_WINDOW_RESIZE)
  );
  const sizeState = useRootEntity().stateAccumulator<Vector>(WINDOW_SIZE);

  let size: Vector;
  if (sizeState.all().length > 0) {
    size = sizeState.all()[0];
  } else {
    size = new Vector(window.innerWidth, window.innerHeight);
    sizeState.add(size);

    let changePending = false;
    window.addEventListener("resize", () => {
      if (window.innerWidth !== size.x) {
        size.x = window.innerWidth;
        changePending = true;
      }
      if (window.innerHeight !== size.y) {
        size.y = window.innerHeight;
        changePending = true;
      }
    });

    useUpdate(() => {
      if (changePending) {
        resizeListeners.callListeners();
        changePending = false;
      }
    });
  }

  return {
    windowSize: size,
    onWindowResize: resizeListeners.addListener,
  };
}
