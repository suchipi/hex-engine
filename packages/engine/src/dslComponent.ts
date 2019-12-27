import BaseComponent, { ComponentInterface } from "./Component";
import Entity from "./Entity";

type DSL = {
  getComponent: ComponentInterface["getComponent"];
  enable: ComponentInterface["enable"];
  disable: ComponentInterface["disable"];
  getEntity: () => Entity | null;

  update: (handler: ComponentInterface["update"]) => void;
  draw: (handler: ComponentInterface["draw"]) => void;

  onEntityReceived: (handler: ComponentInterface["onEntityReceived"]) => void;
  onDisabled: (handler: ComponentInterface["onDisabled"]) => void;
  onEnabled: (handler: ComponentInterface["onEnabled"]) => void;
};

class DSLComponent extends BaseComponent {}

export default function dslComponent(
  body: (dsl: DSL) => void
): ComponentInterface {
  const component = new DSLComponent();

  body({
    getComponent: component.getComponent.bind(component),
    enable: component.enable.bind(component),
    disable: component.disable.bind(component),
    getEntity: () => component.entity,

    update: (handler) => {
      component.update = handler;
    },
    draw: (handler) => {
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

  return component;
}
