import {
  useType,
  Entity,
  Component,
  useRootEntity,
  useCurrentComponent,
  useNewRootComponent,
} from "@hex-engine/core";

function StorageForDebugOverlayDrawTime() {
  useType(StorageForDebugOverlayDrawTime);

  return {
    componentsWithDebugOverlayDrawTime: new WeakMap<Component, true>(),
  };
}

/**
 * This hook specifies to the default draw order sort function
 * that this Component's draw callbacks should be drawn last,
 * after everything else, because this component renders debug overlay(s)
 * that should be drawn on top of everything else.
 *
 * If you are using a custom draw order sort and want to preserve this functionality,
 * you can use the `Canvas.DrawOrder.isDebugOverlay` function to identify Components
 * that have called this hook.
 */
export function useDebugOverlayDrawTime() {
  const storage =
    useRootEntity().getComponent(StorageForDebugOverlayDrawTime) ||
    useNewRootComponent(StorageForDebugOverlayDrawTime);

  storage.componentsWithDebugOverlayDrawTime.set(useCurrentComponent(), true);
}

/**
 * Returns a boolean indicating whether the specified Component has called the useDebugOverlayDrawTime hook.
 * @param component The Component to check.
 * @param storage Optionally, you can pass the StorageForDebugOverlayDrawTime instance here, to avoid looking it up repeatedly.
 */
function isDebugOverlay(
  component: Component,
  storage: ReturnType<
    typeof StorageForDebugOverlayDrawTime
  > | null = useRootEntity().getComponent(StorageForDebugOverlayDrawTime) ||
    useNewRootComponent(StorageForDebugOverlayDrawTime)
) {
  if (!storage) return false;

  return storage.componentsWithDebugOverlayDrawTime.has(component);
}

/** The default draw order. If you are implementing a custom draw order, you may want to call this as your starting point. */
const defaultSort = (entities: Array<Entity>): Array<Component> => {
  let nonDebugOverlayComponents: Array<Component> = [];
  let debugOverlayComponents: Array<Component> = [];

  const storageForIsDebugOverlay = useRootEntity().getComponent(
    StorageForDebugOverlayDrawTime
  );

  // Draw all entities, sorted by id (so that later-created entities are drawn above earlier-created entities)
  for (const ent of [...entities].sort((entA, entB) => entA.id - entB.id)) {
    const myDebugOverlayComponents = [...ent.components].filter((component) =>
      isDebugOverlay(component, storageForIsDebugOverlay)
    );
    const myNonDebugOverlayComponents = [...ent.components].filter(
      (comp) => !isDebugOverlay(comp, storageForIsDebugOverlay)
    );

    debugOverlayComponents = debugOverlayComponents.concat(
      myDebugOverlayComponents
    );
    nonDebugOverlayComponents = nonDebugOverlayComponents.concat(
      myNonDebugOverlayComponents
    );
  }

  return [...nonDebugOverlayComponents, ...debugOverlayComponents];
};

/**
 * This Component can be placed on the root Entity to specify the draw order that the
 * `DrawChildren` Component will use. If no `Canvas.DrawOrder` Component is present on the
 * root Entity, then `Canvas.DrawOrder.defaultSort` will be used as the sort order.
 */
function DrawOrder(sort: (entities: Array<Entity>) => Array<Component>) {
  useType(DrawOrder);

  return { sort };
}

/**
 * This component will check the root Entity for a Canvas.DrawOrder component, and
 * if it is present, it will return its `sort` function. Otherwise, it returns `Canvas.DrawOrder.defaultSort`.
 */
export function useCanvasDrawOrderSort() {
  const drawOrder = useRootEntity().getComponent(DrawOrder);
  return drawOrder?.sort || defaultSort;
}

/**
 * This Component can be placed on the root Entity to specify the draw order that the
 * `DrawChildren` Component will use. If no `Canvas.DrawOrder` Component is present on the
 * root Entity, then `Canvas.DrawOrder.defaultSort` will be used as the sort order.
 */
export default Object.assign(DrawOrder, {
  defaultSort,
  isDebugOverlay,
});
