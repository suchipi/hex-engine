import HooksSystem from "../HooksSystem";
import Entity from "../Entity";

const {
  useCallbackAsCurrent,
  useStateAccumulator,
  useEntity,
} = HooksSystem.hooks;

const ON_DESTROY = Symbol("ON_DESTROY");

/**
 * Return an object with two functions on it: `onDestroy` and `destroy`.
 *
 * - `onDestroy` registers a function to be run if the current Entity is destroyed.
 * - `destroy` destroys the current Entity.
 */
export default function useDestroy() {
  const onDestroyState = useStateAccumulator<() => void>(ON_DESTROY);

  return {
    /**
     * Destroy the current Entity and remove it from its parent.
     */
    destroy: useCallbackAsCurrent(() => {
      const ent = useEntity();
      if (ent.parent) {
        onDestroyState.all().forEach((callback) => callback());
        (ent.parent as Entity)._removeChild(ent as Entity);
      } else {
        throw new Error("Cannot destroy the root entity");
      }
    }),

    /**
     * Register a function to be run when this Entity is destroyed.
     * @param callback The function to run.
     */
    onDestroy: (callback: () => void) => {
      onDestroyState.add(useCallbackAsCurrent(callback));
    },
  };
}
