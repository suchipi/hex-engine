import HooksSystem from "../HooksSystem";
import { Entity } from "../Interface";
const { useEntity } = HooksSystem.hooks;

function gatherDescendants(ent: Entity, descendants: Array<Entity> = []) {
  for (const child of ent.children) {
    descendants.push(child);
  }
  for (const child of ent.children) {
    gatherDescendants(child, descendants);
  }
  return descendants;
}

export default function useDescendantEntities() {
  const ent = useEntity();

  return gatherDescendants(ent);
}
