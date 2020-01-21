import HooksSystem from "../HooksSystem";
import { ON_ENABLED, ON_DISABLED } from "../Component";
const {
  useCallbackAsCurrent,
  useStateAccumulator,
  useIsEnabled,
} = HooksSystem.hooks;

/**
 * Returns an objest with two functions on it: `onEnabled` and `onDisabled`.
 *
 * - `onEnabled` registers a function to be called when the current Component is enabled.
 * - `onDisabled` registers a function to be called when the current Component is disabled.
 */
export default function useEnableDisable() {
  const enabledState = useStateAccumulator<() => void>(ON_ENABLED);
  const disabledState = useStateAccumulator<() => void>(ON_DISABLED);

  return {
    /**
     * Register a function to be called when the current Component is enabled.
     *
     * NOTE: If the current Component is already enabled, this will be called immediately.
     * @param handler The function to call when the current Component is enabled.
     */
    onEnabled: (handler: () => void) => {
      enabledState.add(useCallbackAsCurrent(handler));
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
      disabledState.add(useCallbackAsCurrent(handler));
      if (!useIsEnabled()) {
        handler();
      }
    },
  };
}
