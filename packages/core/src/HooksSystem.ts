import { makeHooksSystem } from "concubine";
import { Component, ComponentImplementation } from "./Component";
import instantiate from "./instantiate";

const HooksSystem = makeHooksSystem<Component>()({
  useNewComponent: (instance) => <Func extends (...args: any[]) => any>(
    ...args: Parameters<Func>[0] extends void
      ? [Func]
      : [Func, Parameters<Func>[0]]
  ): ReturnType<Func> extends {} ? Component & ReturnType<Func> : Component => {
    const [componentFunc, props] = args;

    const child = instantiate(componentFunc, props, instance.entity);
    instance.entity.components.add(child);

    // @ts-ignore
    return child;
  },

  useExistingComponent: (instance) =>
    instance.entity.getComponent.bind(instance.entity),

  useEntity: (instance) => () => instance.entity,

  useCallbackAsCurrent: (instance) => <Func extends (...args: any[]) => any>(
    callback: Func
  ): ((...args: Parameters<Func>) => ReturnType<Func>) => {
    return (...args: Parameters<Func>): ReturnType<Func> => {
      return HooksSystem.withInstance(instance, () => {
        return callback(...args);
      });
    };
  },

  useStateAccumlator: (instance) => <T>(
    key: symbol
  ): { add(newValue: T): void } => {
    const implInstance = instance as ComponentImplementation;

    const state = implInstance._accumulatedState as any;
    if (!state[key]) {
      state[key] = [];
    }

    return {
      add(newValue) {
        state[key].push(newValue);
      },
    };
  },
});

export default HooksSystem;
