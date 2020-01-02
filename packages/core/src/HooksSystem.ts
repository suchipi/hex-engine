import { makeHooksSystem } from "concubine";
import { Component as ComponentInterface } from "./Interface";
import Component from "./Component";
import instantiate from "./instantiate";

const HooksSystem = makeHooksSystem<ComponentInterface>()({
  useNewComponent: (instance) => <T>(
    componentFactory: () => T
  ): T & ComponentInterface => {
    const child = instantiate(componentFactory, instance.entity);
    instance.entity.components.add(child);

    // @ts-ignore
    return child;
  },

  useType: (instance) => (type: (...args: any[]) => any) => {
    instance.type = type;
  },

  useExistingComponentByType: (instance) => <F extends (...args: any[]) => any>(
    componentClass: F
  ): ReturnType<F> extends {}
    ? null | (ComponentInterface & ReturnType<F>)
    : null | ComponentInterface => {
    // @ts-ignore
    return instance.entity.getComponent(componentClass);
  },

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
    const implInstance = instance as Component;

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
