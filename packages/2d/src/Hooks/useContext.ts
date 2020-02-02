import { useType, useRootEntity, useNewRootComponent } from "@hex-engine/core";
import Canvas from "../Canvas";

function StorageForUseContext(): { context: CanvasRenderingContext2D | null } {
  useType(StorageForUseContext);

  return {
    context: null,
  };
}

export function setContext(context: CanvasRenderingContext2D) {
  const storage =
    useRootEntity().getComponent(StorageForUseContext) ||
    useNewRootComponent(StorageForUseContext);
  storage.context = context;
}

/**
 * Returns the 2d rendering context of the root component's Canvas.
 * This is the same context that gets passed into `useDraw`'s callback.
 */
export default function useContext() {
  const storage =
    useRootEntity().getComponent(StorageForUseContext) ||
    useNewRootComponent(StorageForUseContext);
  if (storage.context == null) {
    throw new Error(
      "Attempted to call useContext before setContext, so context was not yet available."
    );
  }

  return storage.context;
}
