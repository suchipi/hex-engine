import {
  useType,
  useRootEntity,
  Entity,
  useNewRootComponent,
} from "@hex-engine/core";
import { Vector } from "../Models";
import Canvas, { useCanvasDrawOrderSort } from "../Canvas";
import { Geometry } from "../Components";
import useEntityTransforms from "./useEntityTransforms";
import useUpdate from "./useUpdate";

/**
 * Caches the result of useEntitiesAtPoint each frame, for the duration of
 * that frame, so that we don't have to calculate the result of useEntitiesAtPoint
 * every frame. This saves a lot of runtime when there are many entities onscreen.
 */
function CacheForUseEntitiesAtPoint() {
  useType(CacheForUseEntitiesAtPoint);

  const result: {
    valid: boolean;
    ents: Array<Entity>;
  } = {
    valid: false,
    ents: [],
  };

  useUpdate(() => {
    // Invalidate cache every frame
    result.valid = false;
  });

  return {
    result,
  };
}

/**
 * Get all the entities at the given world position,
 * sorted by reverse draw order, such that one that
 * gets drawn last (and is therefore on top) is the first in the array.
 */
export default function useEntitiesAtPoint(worldPos: Vector): Array<Entity> {
  const rootEnt = useRootEntity();
  const cache =
    rootEnt.getComponent(CacheForUseEntitiesAtPoint) ||
    useNewRootComponent(CacheForUseEntitiesAtPoint);

  if (cache.result.valid) {
    return cache.result.ents;
  }

  const rootsDescendants = rootEnt.descendants();
  const allEnts = [rootEnt, ...rootsDescendants];
  const entsUnderCursor = allEnts.filter((ent) => {
    const geometry = ent.getComponent(Geometry);
    if (!geometry) return false;

    const transformedPos = useEntityTransforms(ent)
      .matrixForWorldPosition()
      .inverseMutate()
      .transformPoint(worldPos);
    return geometry.shape.containsPoint(transformedPos);
  });
  if (entsUnderCursor.length < 2) {
    cache.result.ents = entsUnderCursor;
    cache.result.valid = true;
    return entsUnderCursor;
  }

  const sort = useCanvasDrawOrderSort();
  const components = sort(entsUnderCursor)
    .filter((comp) => Canvas.DrawOrder.isDebugOverlay(comp))
    .reverse();

  const entsSeenSoFar = new Set();
  const sortedEnts: Array<Entity> = [];

  for (const component of components) {
    const ent = component.entity;

    if (!entsSeenSoFar.has(component.entity)) {
      entsSeenSoFar.add(ent);
      sortedEnts.push(ent);
    }
  }

  cache.result.ents = sortedEnts;
  cache.result.valid = true;

  return sortedEnts;
}
