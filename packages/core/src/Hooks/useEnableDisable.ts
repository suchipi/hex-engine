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
    },
    onDisabled: (handler: () => void) => {
      disabledHandler = useCallbackAsCurrent(handler);
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
