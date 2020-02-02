import HooksSystem from "../HooksSystem";
const {
  useType,
  useCallbackAsCurrent,
  useIsEnabled,
  useNewComponent,
  useEntity,
} = HooksSystem.hooks;

export function StorageForUseEnableDisable() {
  useType(StorageForUseEnableDisable);

  return {
    enableCallbacks: new Set<() => void>(),
    disableCallbacks: new Set<() => void>(),
  };
}

/**
 * Returns an objest with two functions on it: `onEnabled` and `onDisabled`.
 *
 * - `onEnabled` registers a function to be called when the current Component is enabled.
 * - `onDisabled` registers a function to be called when the current Component is disabled.
 */
export default function useEnableDisable() {
  const storage =
    useEntity().getComponent(StorageForUseEnableDisable) ||
    useNewComponent(StorageForUseEnableDisable);

  return {
    /**
     * Register a function to be called when the current Component is enabled.
     *
     * NOTE: If the current Component is already enabled, this will be called immediately.
     * @param handler The function to call when the current Component is enabled.
     */
    onEnabled: (handler: () => void) => {
      storage.enableCallbacks.add(useCallbackAsCurrent(handler));
      if (useIsEnabled()) {
        handler();
      }
    },

    /**
     * Register a function to be called when the current Component is disabled.
     *
     * NOTE: If the current Component is already disabled, this will be called immediately.
     * @param handler The function to be called when the current Component is disabled.
     */
    onDisabled: (handler: () => void) => {
      storage.disableCallbacks.add(useCallbackAsCurrent(handler));
      if (!useIsEnabled()) {
        handler();
      }
    },
  };
}
