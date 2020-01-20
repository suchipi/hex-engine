import { useRootEntity } from "@hex-engine/core";
import { Point } from "../Models";
import Canvas, { useCanvasDrawOrderSort } from "../Canvas";
import { Geometry } from "../Components";
import useEntityTransforms from "./useEntityTransforms";

/**
 * Get all the entities at a given world position,
 * sorted by reverse draw order, such that one that
 * gets drawn last is the first in the array.
 * @param worldPos
 */
export default function useEntitiesAtPoint(worldPos: Point) {
  const rootEnt = useRootEntity();
  const rootsDescendants = rootEnt.descendants();
  const allEnts = [rootEnt, ...rootsDescendants];
  const entsUnderCursor = allEnts.filter((ent) => {
    const geometry = ent.getComponent(Geometry);
    if (!geometry) return false;

    const transformedPos = useEntityTransforms(ent)
      .asMatrix()
      .inverseMutate()
      .transformPoint(worldPos);
    return geometry.shape.containsPoint(transformedPos);
  });
  if (entsUnderCursor.length < 2) return entsUnderCursor;

  const sort = useCanvasDrawOrderSort();
  const components = sort(entsUnderCursor)
    .filter(Canvas.DrawOrder.isDebugOverlay)
    .reverse();

  const entsSeenSoFar = new Set();
  const sortedEnts = [];
  for (const component of components) {
    const ent = component.entity;

    if (!entsSeenSoFar.has(component.entity)) {
      entsSeenSoFar.add(ent);
      sortedEnts.push(ent);
    }
  }
  return sortedEnts;
}
