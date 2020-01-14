import HooksSystem from "../HooksSystem";
import { ON_ENABLED, ON_DISABLED } from "../Component";
const {
  useCallbackAsCurrent,
  useStateAccumulator,
  useIsEnabled,
} = HooksSystem.hooks;

export default function useEnableDisable() {
  const enabledState = useStateAccumulator<() => void>(ON_ENABLED);
  const disabledState = useStateAccumulator<() => void>(ON_DISABLED);

  return {
    onEnabled: (handler: () => void) => {
      enabledState.add(useCallbackAsCurrent(handler));
      if (useIsEnabled()) {
        handler();
      }
    },
    onDisabled: (handler: () => void) => {
      disabledState.add(useCallbackAsCurrent(handler));
      if (!useIsEnabled()) {
        handler();
      }
    },
  };
}
