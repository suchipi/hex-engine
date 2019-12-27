import { makeHooksSystem } from "concubine";
import BaseComponent, { ComponentInterface } from "./Component";

export function instantiate<C extends {}>(
  componentFunction: (...args: any[]) => C
): ComponentInterface & C {
  const instance = new BaseComponent();
  instance.constructor = componentFunction; // For lookup

  let ret;
  HooksSystem.withInstance(instance, () => {
    ret = componentFunction();
  });
  if (ret) {
    Object.assign(instance, ret);
  }

  // @ts-ignore
  return instance;
}

const HooksSystem = makeHooksSystem<ComponentInterface>()({
  create: (instance) => <C>(componentFunction: (...args: any[]) => C): C => {
    const child = instantiate(componentFunction);
    instance._childrenToAdd.push(child);
    return child;
  },

  // TODO: can remove once create is ubiquitous
  addChildComponent: (instance) => <C extends ComponentInterface>(
    child: C
  ): C => {
    instance._childrenToAdd.push(child);
    return child;
  },

  getComponent: (instance) => instance.getComponent.bind(instance),
  enable: (instance) => instance.enable.bind(instance),
  disable: (instance) => instance.disable.bind(instance),

  getEntity: (instance) => () => instance.entity,

  onUpdate: (instance) => (handler: ComponentInterface["update"]) => {
    instance.update = handler;
  },
  onDraw: (instance) => (handler: ComponentInterface["draw"]) => {
    instance.draw = handler;
  },
  onEntityReceived: (instance) => (
    handler: ComponentInterface["onEntityReceived"]
  ) => {
    instance.onEntityReceived = handler;
  },
  onDisabled: (instance) => (handler: ComponentInterface["onDisabled"]) => {
    instance.onDisabled = handler;
  },
  onEnabled: (instance) => (handler: ComponentInterface["onEnabled"]) => {
    instance.onEnabled = handler;
  },
});

export default HooksSystem;
