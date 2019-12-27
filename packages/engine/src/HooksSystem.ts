import { makeHooksSystem } from "concubine";
import Component, { ComponentInterface } from "./Component";
import Element from "./Element";

export function instantiate<Props extends {}, API extends {}>(
  element: Element<Props, API>
): ComponentInterface & API {
  if (element.type.prototype.isClassComponent) {
    // @ts-ignore
    return new element.type(element.props);
  } else {
    const instance = new Component();
    instance.constructor = element.type; // For lookup

    let ret;
    HooksSystem.withInstance(instance, () => {
      ret = element.type(element.props);
    });
    if (ret) {
      Object.assign(instance, ret);
    }

    // @ts-ignore
    return instance;
  }
}

const HooksSystem = makeHooksSystem<ComponentInterface>()({
  create: (instance) => <Props, API>(
    element: Element<Props, API>
  ): ComponentInterface & API => {
    const child = instantiate(element);
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
