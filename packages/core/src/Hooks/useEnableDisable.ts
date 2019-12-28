import HooksSystem from "../HooksSystem";
const { useCallbackAsCurrent } = HooksSystem.hooks;

export default function useEnableDisable() {
  let isEnabled = true;
  let enabledHandler = () => {};
  let disabledHandler = () => {};

  return {
    getIsEnabled: () => isEnabled,

    onEnabled: (handler: () => void) => {
      enabledHandler = useCallbackAsCurrent(handler);
      if (isEnabled) {
        enabledHandler();
      }
    },
    onDisabled: (handler: () => void) => {
      disabledHandler = useCallbackAsCurrent(handler);
      if (!isEnabled) {
        disabledHandler();
      }
    },

    enable: () => {
      isEnabled = true;
      enabledHandler();
    },
    disable: () => {
      isEnabled = false;
      disabledHandler();
    },
  };
}
