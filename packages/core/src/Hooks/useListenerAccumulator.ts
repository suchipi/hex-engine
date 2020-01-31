import useEnableDisable from "./useEnableDisable";
import HooksSystem from "../HooksSystem";
import StateAccumulator from "../StateAccumulator";

const { useCallbackAsCurrent, useIsEnabled } = HooksSystem.hooks;

/**
 * Stores listener callbacks in the received StateAccumulator,
 * and adds/removes them from the StateAccumulator when the current
 * component is enabled/disabled.
 *
 * This lets you store all your listeners in one StateAccumulator
 * (on the root entity, for example), but still handles enabling and
 * disabling as if the listeners were on the local component.
 */
export default function useListenerAccumulator<
  T extends (...args: any[]) => any
>(
  stateAccumulator: StateAccumulator<(...args: Parameters<T>) => ReturnType<T>>
) {
  const addedListeners: Array<(...args: Parameters<T>) => ReturnType<T>> = [];

  const { onEnabled, onDisabled } = useEnableDisable();

  onEnabled(() => {
    addedListeners.forEach((listener) => {
      stateAccumulator.add(listener);
    });
  });

  onDisabled(() => {
    addedListeners.forEach((listener) => {
      stateAccumulator.remove(listener);
    });
  });

  const compIsEnabled = useCallbackAsCurrent(useIsEnabled);

  return {
    addListener(callback: T): void {
      const wrapped = useCallbackAsCurrent(callback);
      addedListeners.push(wrapped);
      if (compIsEnabled()) {
        stateAccumulator.add(wrapped);
      }
    },
    callListeners(...args: Parameters<T>) {
      stateAccumulator.all().forEach((callback) => callback(...args));
    },
  };
}
