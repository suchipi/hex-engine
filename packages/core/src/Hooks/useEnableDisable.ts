import HooksSystem from "../HooksSystem";
const {
  useType,
  useCallbackAsCurrent,
  useCurrentComponent,
  useNewComponent,
  useEntity,
} = HooksSystem.hooks;
import { Component } from "../Interface";

export function StorageForUseEnableDisable() {
  useType(StorageForUseEnableDisable);

  return {
    enableCallbacks: new WeakMap<Component, Set<() => void>>(),
    disableCallbacks: new WeakMap<Component, Set<() => void>>(),
  };
}

/**
 *
 * Returns an objest with three properties on it: `isEnabled`, `onEnabled` and `onDisabled`.
 * - `isEnabled` is a writable boolean indicating whether the component is currently enabled.
 * - `onEnabled` is a function that registers another function to be called when the current Component is enabled.
 * - `onDisabled` is a function that registers another function to be called when the current Component is disabled.
 *
 * Note: If the Component is already enabled when you call `onEnabled`, then
 * the function you provide to `onEnabled` will be called immediately. Likewise,
 * if the Component is already disabled when you call `onDisabled`, then the
 * function you provide to `onDisabled` will be called immediately.
 *
 */
export default function useEnableDisable() {
  const storage =
    useEntity().getComponent(StorageForUseEnableDisable) ||
    useNewComponent(StorageForUseEnableDisable);

  const component = useCurrentComponent();

  return {
    get isEnabled() {
      return component.isEnabled;
    },
    set isEnabled(nextValue: boolean) {
      component.isEnabled = nextValue;
    },

    /**
     * Register a function to be called when the current Component is enabled.
     *
     * NOTE: If the current Component is already enabled, this will be called immediately.
     * @param handler The function to call when the current Component is enabled.
     */
    onEnabled: (handler: () => void) => {
      let componentStorage = storage.enableCallbacks.get(component);
      if (!componentStorage) {
        componentStorage = new Set<() => void>();
        storage.enableCallbacks.set(component, componentStorage);
      }

      componentStorage.add(useCallbackAsCurrent(handler));
      if (component.isEnabled) {
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
      let componentStorage = storage.disableCallbacks.get(component);
      if (!componentStorage) {
        componentStorage = new Set<() => void>();
        storage.disableCallbacks.set(component, componentStorage);
      }

      componentStorage.add(useCallbackAsCurrent(handler));
      if (!component.isEnabled) {
        handler();
      }
    },
  };
}
