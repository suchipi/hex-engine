import { Entity } from "./Entity";

export type ComponentFunction<Props, API> = (props: Props) => API;

export interface Component {
  type: ComponentFunction<any, any>;
  entity: Entity;
  accumulatedState<T>(key: symbol): Array<T>;
}

export class ComponentImplementation implements Component {
  type: ComponentFunction<any, any>;
  entity: Entity;

  // This really should be { [key: symbol]: any },
  // but TypeScript doesn't allow using symbols as indexers.
  _accumulatedState: any = {};

  constructor(type: ComponentFunction<any, any>, entity: Entity) {
    this.type = type;
    this.entity = entity;
  }

  accumulatedState<T>(key: symbol): Array<T> {
    return this._accumulatedState[key] || [];
  }
}
