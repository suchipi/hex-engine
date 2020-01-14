import HooksSystem from "../HooksSystem";
const { useEntity } = HooksSystem.hooks;

export default function useAncestorEntities() {
  const ent = useEntity();

  const ancestors = [];

  let currentEnt = ent.parent;
  while (currentEnt) {
    ancestors.unshift(currentEnt);
    currentEnt = currentEnt.parent;
  }

  return ancestors;
}
