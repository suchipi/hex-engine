import { useType, useRootEntity, useNewRootComponent } from "@hex-engine/core";

function StorageForUseBackstage(): {
  backstage: CanvasRenderingContext2D | null;
} {
  useType(StorageForUseBackstage);

  return {
    backstage: null,
  };
}

export function setBackstage(backstage: CanvasRenderingContext2D) {
  const storage =
    useRootEntity().getComponent(StorageForUseBackstage) ||
    useNewRootComponent(StorageForUseBackstage);
  storage.backstage = backstage;
}

/**
 * Returns a "backstage" canvas context that gets cleared between every component draw.
 * The canvas associated with this backstage context is never shown to the user.
 * You can use this backstage context as a working space to render into, if needed.
 */
export default function useBackstage() {
  const storage =
    useRootEntity().getComponent(StorageForUseBackstage) ||
    useNewRootComponent(StorageForUseBackstage);
  if (storage.backstage == null) {
    throw new Error(
      "Attempted to call useBackstage before setBackstage, so context was not yet available."
    );
  }

  return storage.backstage;
}
