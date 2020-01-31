import {
  Component as ComponentInterface,
  Entity as EntityInterface,
} from "./Interface";
import StateAccumulator from "./StateAccumulator";

export const ON_ENABLED = Symbol("ON_ENABLED");
export const ON_DISABLED = Symbol("ON_DISABLED");

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

  stateAccumulator<T>(key: symbol): StateAccumulator<T> {
    const state = this._accumulatedState;
    if (!state[key]) {
      state[key] = new StateAccumulator<T>();
    }

    return state[key];
  }

  _isEnabled: boolean = true;
  get isEnabled() {
    return this._isEnabled;
  }
  set isEnabled(nextVal) {
    if (Boolean(nextVal) === this._isEnabled) return;

    if (nextVal) {
      this.enable();
    } else {
      this.disable();
    }
  }

  enable() {
    this.stateAccumulator<() => void>(ON_ENABLED)
      .all()
      .forEach((callback) => callback());
    this._isEnabled = true;
  }
  disable() {
    this.stateAccumulator<() => void>(ON_DISABLED)
      .all()
      .forEach((callback) => callback());
    this._isEnabled = false;
  }
}
