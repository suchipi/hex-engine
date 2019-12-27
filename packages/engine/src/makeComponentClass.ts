import BaseComponent, { ComponentInterface } from "./Component";
import Entity from "./Entity";

export type DSL = {
  getConstructorArguments: () => Array<any>;
  addChildComponent: <C extends ComponentInterface>(child: C) => C;

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

type ComponentClass<AdditionalAPI> = {
  new (): ComponentInterface & AdditionalAPI;
};

export default function makeComponentClass<ReturnType extends {}>(
  constructor: (dsl: DSL) => void | ReturnType
): ComponentClass<ReturnType> {
  // @ts-ignore
  return class Component extends BaseComponent {
    _childrenToAdd: Array<ComponentInterface> = [];
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

      const dsl: DSL = {
        getConstructorArguments: () => args,
        addChildComponent: (child) => {
          this._childrenToAdd.push(child);
          return child;
        },

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
      };

      const returnedValue = constructor(dsl);

      if (returnedValue) {
        Object.assign(component, returnedValue);
      }
    }
  };
}
