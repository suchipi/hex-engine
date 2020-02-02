import {
  Component as ComponentInterface,
  Entity as EntityInterface,
} from "./Interface";
import { StorageForUseEnableDisable } from "./Hooks/useEnableDisable";

export default class Component implements ComponentInterface {
  _kind: "component" = "component";

  type = null;

  entity: EntityInterface;

  constructor(entity: EntityInterface) {
    this.entity = entity;
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
    if (this._isEnabled) return;
    this._isEnabled = true;

    const storage = this.entity.getComponent(StorageForUseEnableDisable);
    if (storage) {
      storage.enableCallbacks.forEach((callback) => callback());
    }
  }

  disable() {
    if (!this._isEnabled) return;
    this._isEnabled = false;

    const storage = this.entity.getComponent(StorageForUseEnableDisable);
    if (storage) {
      storage.disableCallbacks.forEach((callback) => callback());
    }
  }
}
