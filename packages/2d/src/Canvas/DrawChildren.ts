import {
  useCallbackAsCurrent,
  useEntity,
  useFrame,
  Component,
  useType,
  useNewComponent,
  useCurrentComponent,
  useRootEntity,
  useNewRootComponent,
} from "@hex-engine/core";
import { useCanvasDrawOrderSort } from "./DrawOrder";
import useContext from "../Hooks/useContext";

type DrawCallback = (context: CanvasRenderingContext2D) => void;

function StorageForDrawChildren() {
  useType(StorageForDrawChildren);

  return {
    callbacksByComponent: new WeakMap<Component, Set<DrawCallback>>(),
  };
}

/**
 * Registers a function to be called once a frame, after all `useUpdate` functions have been called.
 *
 * Unlike `useDraw`, `useRawDraw` does *not* transform the context by the current Entity's matrix transform.
 *
 * In most cases, you should use `useDraw` instead of `useRawDraw`.
 */
export function useRawDraw(callback: DrawCallback) {
  const storage =
    useRootEntity().getComponent(StorageForDrawChildren) ||
    useNewRootComponent(StorageForDrawChildren);

  const component = useCurrentComponent();
  let storageForComponent: Set<DrawCallback>;
  const maybeStorageForComponent = storage.callbacksByComponent.get(component);
  if (maybeStorageForComponent) {
    storageForComponent = maybeStorageForComponent;
  } else {
    storageForComponent = new Set();
    storage.callbacksByComponent.set(component, storageForComponent);
  }

  storageForComponent.add(useCallbackAsCurrent(callback));
}

/**
 * Iterates over all the descendant Entities, and calls their registered
 * draw callbacks, in the order specified by the Canvas.DrawOrder component
 * on the root Entity, or a default order if there is no such component.
 */
export function DrawChildren({
  backgroundColor,
}: {
  backgroundColor: string | null;
}) {
  useType(DrawChildren);

  const context = useContext();

  const storage = useNewComponent(StorageForDrawChildren);

  function drawComponent(component: Component) {
    if (component.isEnabled) {
      const maybeStorageForComponent = storage.callbacksByComponent.get(
        component
      );
      if (maybeStorageForComponent) {
        for (const drawCallback of maybeStorageForComponent) {
          drawCallback(context);
        }
      }
    }
  }

  useFrame(() => {
    // Reset transform
    context.resetTransform();

    // Clear canvas
    if (backgroundColor != null) {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }

    const sort = useCanvasDrawOrderSort();

    const ent = useEntity();
    const ents = [ent, ...ent.descendants()];
    const components = sort(ents);

    for (const component of components) {
      drawComponent(component);
    }
  });
}
