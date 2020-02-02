import {
  useRootEntity,
  useType,
  useCallbackAsCurrent,
  useCurrentComponent,
  useNewRootComponent,
} from "@hex-engine/core";
import { useUpdate } from ".";
import { Vector } from "../Models";

function StorageForWindowSize() {
  useType(StorageForWindowSize);

  const size = new Vector(window.innerWidth, window.innerHeight);
  const listeners = new Set<() => void>();

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
