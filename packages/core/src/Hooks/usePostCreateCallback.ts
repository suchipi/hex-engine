import { Component } from "../Interface";
import HooksSystem from "../HooksSystem";
const { useCurrentComponent } = HooksSystem.hooks;

export const POST_CREATE_CALLBACK = Symbol("POST_CREATE_CALLBACK");

/**
 * Registers a callback to be called immediately after the current component
 * function returns (synchronously). The callback will receive the "full" component
 * instance, including any properties added due to the return value of the current
 * component function.
 *
 * This is used to write hooks that have access to the "full" component instance,
 * including its additional properties added from its return value.
 */
export default function usePostCreateCallback<ReturnValue = any>(
  callback: (createdComponent: Component & ReturnValue) => any
): void {
  const instance = useCurrentComponent();
  const callbacksSet =
    instance[POST_CREATE_CALLBACK] ||
    (instance[POST_CREATE_CALLBACK] = new Set<(ret: ReturnValue) => any>());
  callbacksSet.add(callback);
}
