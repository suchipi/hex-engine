import {
  useType,
  Entity,
  Component,
  useStateAccumulator,
  useRootEntity,
} from "@hex-engine/core";

const DEBUG_OVERLAY = Symbol("DRAW_ORDER_OVERLAY");

export function useDebugOverlayDrawTime() {
  useStateAccumulator(DEBUG_OVERLAY).add(true);
}

function isDebugOverlay(component: Component) {
  return component.stateAccumulator(DEBUG_OVERLAY).all().length > 0;
}

const defaultSort = (entities: Array<Entity>): Array<Component> => {
  let nonDebugOverlayComponents: Array<Component> = [];
  let debugOverlayComponents: Array<Component> = [];

  // Draw all entities, sorted by id (so that later-created entities are drawn above earlier-created entities)
  for (const ent of [...entities].sort((entA, entB) => entA.id - entB.id)) {
    const myDebugOverlayComponents = [...ent.components].filter(isDebugOverlay);
    const myNonDebugOverlayComponents = [...ent.components].filter(
      (comp) => !isDebugOverlay(comp)
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

function DrawOrder(sort: (entities: Array<Entity>) => Array<Component>) {
  useType(DrawOrder);

  return { sort };
}

export function useCanvasDrawOrderSort() {
  const drawOrder = useRootEntity().getComponent(DrawOrder);
  return drawOrder?.sort || defaultSort;
}

export default Object.assign(DrawOrder, {
  defaultSort,
  isDebugOverlay,
});
