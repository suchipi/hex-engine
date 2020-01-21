import HooksSystem from "../HooksSystem";
const { useEntity } = HooksSystem.hooks;

/**
 * Searches upwards through the current Entity's parents and finds the first
 * Entity without a parent; namely, the root entity.
 *
 * This will always be the Entity you created via `createRoot`.
 */
export default function useRootEntity() {
  const ent = useEntity();

  let currentEnt = ent;
  while (currentEnt.parent) {
    currentEnt = currentEnt.parent;
  }

  return currentEnt;
}
