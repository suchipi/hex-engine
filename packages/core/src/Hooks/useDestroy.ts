import HooksSystem from "../HooksSystem";
import { ON_DESTROY } from "../Entity";

const { useCallbackAsCurrent, useEntity } = HooksSystem.hooks;

/**
 * Return an object with two functions on it: `onDestroy` and `destroy`.
 *
 * - `onDestroy` registers a function to be run if the current Entity is destroyed.
 * - `destroy` destroys the current Entity.
 */
export default function useDestroy() {
  const onDestroyState = useEntity().stateAccumulator<() => void>(ON_DESTROY);

  return {
    /**
     * Destroy the current Entity and remove it from its parent.
     */
    destroy: useCallbackAsCurrent(() => {
      useEntity().destroy();
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
