import { makeHooksSystem } from "concubine";
import Entity from "./Entity";
import {
  Component as ComponentInterface,
  Entity as EntityInterface,
} from "./Interface";
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
  ): { add(newValue: T): void; all(): Array<T> } => {
    const implInstance = instance as Component;

    return implInstance.stateAccumulator<T>(key);
  },

  useIsEnabled: (instance) => () => instance.isEnabled,

  useChild: (instance) => <T>(
    componentFactory: () => T
  ): EntityInterface & {
    api: T extends {} ? T & ComponentInterface : ComponentInterface;
  } => {
    const ent = instance.entity;
    return Entity._create(componentFactory, ent);
  },
});

export default HooksSystem;
