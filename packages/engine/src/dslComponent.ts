import BaseComponent, { ComponentInterface } from "./Component";
import Entity from "./Entity";

type DSL = {
  getComponent: ComponentInterface["getComponent"];
  enable: ComponentInterface["enable"];
  disable: ComponentInterface["disable"];
  getEntity: () => Entity | null;

  onUpdate: (handler: ComponentInterface["update"]) => void;
  onDraw: (handler: ComponentInterface["draw"]) => void;

  onEntityReceived: (handler: ComponentInterface["onEntityReceived"]) => void;
  onDisabled: (handler: ComponentInterface["onDisabled"]) => void;
  onEnabled: (handler: ComponentInterface["onEnabled"]) => void;
};

export default function dslComponent(
  body: (dsl: DSL) => void | ComponentInterface | Array<ComponentInterface>
): Array<ComponentInterface> {
  const component: ComponentInterface = new BaseComponent();

  const ret = body({
    getComponent: component.getComponent.bind(component),
    enable: component.enable.bind(component),
    disable: component.disable.bind(component),
    getEntity: () => component.entity,

    onUpdate: (handler) => {
      component.update = handler;
    },
    onDraw: (handler) => {
      component.draw = handler;
    },

    onEntityReceived: (handler) => {
      component.onEntityReceived = handler;
    },

    onEnabled: (handler) => {
      component.onEnabled = handler;
    },

    onDisabled: (handler) => {
      component.onDisabled = handler;
    },
  });

  if (Array.isArray(ret)) {
    return [component, ...ret];
  } else if (ret) {
    return [component, ret];
  } else {
    return [component];
  }
}
