import {
  Component as ComponentInterface,
  Entity as EntityInterface,
} from "./Interface";
import { StorageForUseEnableDisable } from "./Hooks/useEnableDisable";
import { CoreEventPhase, CoreEventType, events } from "./CoreEvents";

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

    events.emit({
      eventType: CoreEventType.COMPONENT_ENABLE,
      eventPhase: CoreEventPhase.BEFORE,
      component: this,
    });

    this._isEnabling = true;
    // Set before running the callbacks, so that a callback asking whether the
    // Component is enabled is told about the state it is being notified of.
    this._isEnabled = true;

    const storage = this.entity.getComponent(StorageForUseEnableDisable);
    if (storage) {
      const componentStorage = storage.enableCallbacks.get(this);
      if (componentStorage) {
        componentStorage.forEach((callback) => callback());
      }
    }

    this._isEnabling = false;

    events.emit({
      eventType: CoreEventType.COMPONENT_ENABLE,
      eventPhase: CoreEventPhase.AFTER,
      component: this,
    });
  }

  _isDisabling: boolean = false;

  disable() {
    if (!this._isEnabled || this._isDisabling) return;

    events.emit({
      eventType: CoreEventType.COMPONENT_DISABLE,
      eventPhase: CoreEventPhase.BEFORE,
      component: this,
    });

    this._isDisabling = true;
    // Set before running the callbacks, so that a callback asking whether the
    // Component is enabled is told about the state it is being notified of.
    this._isEnabled = false;

    const storage = this.entity.getComponent(StorageForUseEnableDisable);
    if (storage) {
      const componentStorage = storage.disableCallbacks.get(this);
      if (componentStorage) {
        componentStorage.forEach((callback) => callback());
      }
    }

    this._isDisabling = false;

    events.emit({
      eventType: CoreEventType.COMPONENT_DISABLE,
      eventPhase: CoreEventPhase.AFTER,
      component: this,
    });
  }
}
