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

  _isEnabling: boolean = false;

  enable() {
    if (this._isEnabled || this._isEnabling) return;
    this._isEnabling = true;

    const storage = this.entity.getComponent(StorageForUseEnableDisable);
    if (storage) {
      const componentStorage = storage.enableCallbacks.get(this);
      if (componentStorage) {
        componentStorage.forEach((callback) => callback());
      }
    }

    this._isEnabled = true;
  }

  _isDisabling: boolean = false;

  disable() {
    if (!this._isEnabled || this._isDisabling) return;
    this._isDisabling = true;

    const storage = this.entity.getComponent(StorageForUseEnableDisable);
    if (storage) {
      const componentStorage = storage.disableCallbacks.get(this);
      if (componentStorage) {
        componentStorage.forEach((callback) => callback());
      }
    }

    this._isEnabled = false;
  }
}
