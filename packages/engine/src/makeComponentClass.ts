import BaseComponent, { ComponentInterface } from "./Component";
import Entity from "./Entity";

export type DSL = {
  getConstructorArguments: () => Array<any>;

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

type ComponentClass = { new (): ComponentInterface };

export default function makeComponentClass(
  constructor: (
    dsl: DSL
  ) => void | ComponentInterface | Array<ComponentInterface>
): ComponentClass {
  return class Component extends BaseComponent {
    _childrenToAdd: Array<ComponentInterface>;
    _onEntityReceived: ComponentInterface["onEntityReceived"] = () => {};

    onEntityReceived(entity: Entity | null) {
      if (entity) {
        for (const child of this._childrenToAdd) {
          entity.addComponent(child);
        }
      }

      this._onEntityReceived(entity);
    }

    constructor(...args: Array<any>) {
      super();

      const component = this;

      const ret = constructor({
        getConstructorArguments: () => args,

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
          component._onEntityReceived = handler;
        },

        onEnabled: (handler) => {
          component.onEnabled = handler;
        },

        onDisabled: (handler) => {
          component.onDisabled = handler;
        },
      });

      let children: Array<ComponentInterface>;
      if (Array.isArray(ret)) {
        children = ret;
      } else if (ret) {
        children = [ret];
      } else {
        children = [];
      }

      this._childrenToAdd = children;
    }
  };
}
