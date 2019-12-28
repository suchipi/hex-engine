import HooksSystem from "../HooksSystem";
const { useEntity } = HooksSystem.hooks;

export default function useRootEntity() {
  const ent = useEntity();

  let currentEnt = ent;
  while (currentEnt.parent) {
    currentEnt = currentEnt.parent;
  }

  return currentEnt;
}
