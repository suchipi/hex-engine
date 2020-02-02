import {
  useCallbackAsCurrent,
  useType,
  useNewComponent,
  useEntity,
  Component,
  useCurrentComponent,
} from "@hex-engine/core";

export function StorageForInspectorHover() {
  useType(StorageForInspectorHover);

  return {
    beginCallbacks: new WeakMap<Component, Set<() => void>>(),
    endCallbacks: new WeakMap<Component, Set<() => void>>(),
  };
}

/**
 * Returns an object with three properties:
 *
 * - `isHovered`: Whether the current Component, Entity, or one of its parents is
 * currently being hovered over in the Inspector.
 * - `onHoverStart`: Register a function to be run when the user starts hovering over
 * the current Component, Entity, or one of its parents in the Inspector.
 * - `onHoverEnd`: Register a function to be run when the user stops hovering over
 * the current Component, Entity, or one of its parents in the Inspector.
 *
 * The idea here is that when someone hovers over the Component or Entity in the
 * Inspector, you visually highlight the corresponding rendered objects, if any.
 */
export default function useInspectorHover() {
  const storage =
    useEntity().getComponent(StorageForInspectorHover) ||
    useNewComponent(StorageForInspectorHover);

  const component = useCurrentComponent();

  const api = {
    isHovered: false,
    onHoverStart(callback: () => void) {
      let storageForComponent = storage.beginCallbacks.get(component);
      if (!storageForComponent) {
        storageForComponent = new Set<() => void>();
        storage.beginCallbacks.set(component, storageForComponent);
      }

      storageForComponent.add(useCallbackAsCurrent(callback));
    },
    onHoverEnd(callback: () => void) {
      let storageForComponent = storage.endCallbacks.get(component);
      if (!storageForComponent) {
        storageForComponent = new Set<() => void>();
        storage.endCallbacks.set(component, storageForComponent);
      }

      storageForComponent.add(useCallbackAsCurrent(callback));
    },
  };

  api.onHoverStart(() => (api.isHovered = true));
  api.onHoverEnd(() => (api.isHovered = false));

  return api;
}
