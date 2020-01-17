import { makeHooksSystem } from "concubine";
import Entity from "./Entity";
import {
  Component as ComponentInterface,
  Entity as EntityInterface,
} from "./Interface";
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
    const func = (...args: Parameters<Func>): ReturnType<Func> => {
      return HooksSystem.withInstance(instance, () => {
        return callback(...args);
      });
    };
    // To make debugging easier
    func.toString = () => "useCallbackAsCurrent(" + callback.toString() + ")";
    return func;
  },

  useStateAccumulator: (instance) => <T>(
    key: symbol
  ): { add(newValue: T): void; all(): Array<T> } => {
    return instance.stateAccumulator<T>(key);
  },

  useIsEnabled: (instance) => () => instance.isEnabled,

  useChild: (instance) => <T>(
    componentFactory: () => T
  ): EntityInterface & {
    rootComponent: T extends {} ? T & ComponentInterface : ComponentInterface;
  } => {
    const ent = instance.entity;
    return Entity._create(componentFactory, ent);
  },
});

export default HooksSystem;
