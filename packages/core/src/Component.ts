import {
  ComponentFunction,
  Component as ComponentInterface,
  Entity as EntityInterface,
} from "./Interface";

export default class Component implements ComponentInterface {
  _kind: "component" = "component";

  type: ComponentFunction<any, any>;
  entity: EntityInterface;

  // This really should be { [key: symbol]: any },
  // but TypeScript doesn't allow using symbols as indexers.
  _accumulatedState: any = {};

  constructor(type: ComponentFunction<any, any>, entity: EntityInterface) {
    this.type = type;
    this.entity = entity;
  }

  accumulatedState<T>(key: symbol): Array<T> {
    return this._accumulatedState[key] || [];
  }
}
