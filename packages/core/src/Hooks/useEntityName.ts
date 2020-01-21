import HooksSystem from "../HooksSystem";
const { useEntity } = HooksSystem.hooks;

/**
 * Sets or gets the name of the current Entity.
 *
 * This is just a nice-to-have for debugging purposes;
 * if you don't do this, we will do our best to give the Entity
 * a name based on its root Component.
 * @param name The name for the Entity.
 */
export default function useEntityName(name: string): string | null {
  const ent = useEntity();
  if (name) {
    ent.name = name;
  }
  return ent.name || null;
}
