import HooksSystem from "../HooksSystem";
const { useEntity } = HooksSystem.hooks;

/**
 * Sets the name of the current Entity.
 *
 * This is just a nice-to-have for debugging purposes;
 * if you don't do this, we will do our best to give the Entity
 * a name based on its root Component.
 * @param name The name for the Entity.
 */
export default function useEntityName(name: string) {
  const ent = useEntity();
  ent.name = name;
}
