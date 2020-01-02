import {
  Component as ComponentInterface,
  Entity as EntityInterface,
} from "./Interface";

export default class Component implements ComponentInterface {
  _kind: "component" = "component";

  type = null;

  entity: EntityInterface;

  // This really should be { [key: symbol]: any },
  // but TypeScript doesn't allow using unique symbols as indexers.
  _accumulatedState: any = {};

  constructor(entity: EntityInterface) {
    this.entity = entity;
  }

  accumulatedState<T>(key: symbol): Array<T> {
    return this._accumulatedState[key] || [];
  }
}
