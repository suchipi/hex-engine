import HooksSystem from "../HooksSystem";
import { ON_ENABLED, ON_DISABLED } from "../Component";
const {
  useCallbackAsCurrent,
  useStateAccumlator,
  useIsEnabled,
} = HooksSystem.hooks;

export default function useEnableDisable() {
  const enabledState = useStateAccumlator<() => void>(ON_ENABLED);
  const disabledState = useStateAccumlator<() => void>(ON_DISABLED);

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
