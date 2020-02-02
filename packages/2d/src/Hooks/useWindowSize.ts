import {
  useRootEntity,
  useType,
  useCallbackAsCurrent,
  useCurrentComponent,
  useNewRootComponent,
} from "@hex-engine/core";
import { useUpdate, useContext } from ".";
import { Vector } from "../Models";

function StorageForWindowSize() {
  useType(StorageForWindowSize);

  const { canvas } = useContext();
  const win = canvas.ownerDocument?.defaultView;
  if (!win) {
    throw new Error(
      "Root canvas is not part of a document; therefore, useWindowSize can't setup event listeners"
    );
  }
  const size = new Vector(win.innerWidth, win.innerHeight);
  const listeners = new Set<() => void>();

  let changePending = false;
  win.addEventListener("resize", () => {
    if (win.innerWidth !== size.x) {
      size.x = win.innerWidth;
      changePending = true;
    }
    if (win.innerHeight !== size.y) {
      size.y = win.innerHeight;
      changePending = true;
    }
  });

  useUpdate(() => {
    if (changePending) {
      listeners.forEach((callback) => callback());
      changePending = false;
    }
  });

  return {
    size,
    listeners,
  };
}

/**
 * Returns an object with two properties on it:
 * - `windowSize: Vector`: A Vector that will get mutated such that it always equals the window size
 * - `onWindowResize(() => void): void`: A function that lets you register
 * a function to be run every time the window size changes.
 */
export default function useWindowSize() {
  const storage =
    useRootEntity().getComponent(StorageForWindowSize) ||
    useNewRootComponent(StorageForWindowSize);

  return {
    windowSize: storage.size,
    onWindowResize: (callback: () => void) => {
      const component = useCurrentComponent();
      const wrapped = useCallbackAsCurrent(callback);
      storage.listeners.add(() => {
        if (component.isEnabled) {
          wrapped();
        }
      });
    },
  };
}
