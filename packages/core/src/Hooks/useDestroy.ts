import HooksSystem from "../HooksSystem";

const {
  useCallbackAsCurrent,
  useEntity,
  useType,
  useNewComponent,
} = HooksSystem.hooks;

export function StorageForUseDestroy() {
  useType(StorageForUseDestroy);

  return {
    callbacks: new Set<() => void>(),
  };
}

/**
 * Return an object with two functions on it: `onDestroy` and `destroy`.
 *
 * - `onDestroy` registers a function to be run if the current Entity is destroyed.
 * - `destroy` destroys the current Entity.
 */
export default function useDestroy() {
  const storage =
    useEntity().getComponent(StorageForUseDestroy) ||
    useNewComponent(StorageForUseDestroy);

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
      storage.callbacks.add(useCallbackAsCurrent(callback));
    },
  };
}
