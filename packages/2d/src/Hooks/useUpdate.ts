import {
  useCallbackAsCurrent,
  useFrame,
  useType,
  useEntity,
  useRootEntity,
  Component,
  useCurrentComponent,
  useNewComponent,
  useNewRootComponent,
} from "@hex-engine/core";

type UpdateCallback = (delta: number) => void;

function StorageForUpdateChildren() {
  useType(StorageForUpdateChildren);

  return {
    callbacksByComponent: new WeakMap<Component, Set<UpdateCallback>>(),
  };
}

/**
 * Once a frame, iterates over all of the current Entity's descendant Entities, calling
 * any update functions registered by their Components.
 */
function UpdateChildren() {
  useType(UpdateChildren);

  const storage = useNewComponent(StorageForUpdateChildren);

  useFrame((delta) => {
    const ent = useEntity();
    const ents = [ent, ...ent.descendants()];
    for (const ent of ents) {
      for (const component of ent.components) {
        if (component.isEnabled) {
          const maybeUpdateCallbacks = storage.callbacksByComponent.get(
            component
          );
          if (maybeUpdateCallbacks) {
            for (const updateCallback of maybeUpdateCallbacks) {
              updateCallback(delta);
            }
          }
        }
      }
    }
  });
}

/**
 * Registers a function to be called once every frame, prior to drawing.
 *
 * The function will receive a single argument, `delta`, which is the number of milliseconds
 * that have passed since the last frame was rendered.
 */
export default function useUpdate(callback: UpdateCallback) {
  useRootEntity().getComponent(UpdateChildren) ||
    useNewRootComponent(UpdateChildren);

  const storage =
    useRootEntity().getComponent(StorageForUpdateChildren) ||
    useNewRootComponent(StorageForUpdateChildren);

  const component = useCurrentComponent();
  let storageForComponent: Set<UpdateCallback>;
  const maybeStorageForComponent = storage.callbacksByComponent.get(component);
  if (maybeStorageForComponent) {
    storageForComponent = maybeStorageForComponent;
  } else {
    storageForComponent = new Set();
    storage.callbacksByComponent.set(component, storageForComponent);
  }

  storageForComponent.add(useCallbackAsCurrent(callback));
}
