import HooksSystem from "../HooksSystem";
const { useCallbackAsCurrent } = HooksSystem.hooks;

export default Object.assign(
  function useEnableDisable() {
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
  },
  {
    combineApis(
      ...apis: Array<{
        getIsEnabled: () => boolean;
        enable: () => void;
        disable: () => void;
      }>
    ) {
      let isEnabled = true;
      return {
        getIsEnabled: () => isEnabled,
        enable: () => {
          apis.forEach((api) => api.enable());
          isEnabled = true;
        },
        disable: () => {
          apis.forEach((api) => api.disable());
          isEnabled = false;
        },
      };
    },
  }
);
