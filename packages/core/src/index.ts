import Entity from "./Entity";
import {
  Entity as EntityInterface,
  Component as ComponentInterface,
} from "./Interface";
import HooksSystem from "./HooksSystem";
import * as Components from "./Components";

const {
  useNewComponent,
  useExistingComponentByType,
  useEntity,
  useCallbackAsCurrent,
  useStateAccumlator,
  useType,
} = HooksSystem.hooks;

const createEntity = (func: () => any): EntityInterface => {
  function fromCreateEntity() {
    useType(fromCreateEntity);
    useNewComponent(Components.EnableDisableEntity);
    return func();
  }
  return Entity._create(fromCreateEntity);
};

export {
  Components,
  EntityInterface as Entity,
  ComponentInterface as Component,
  createEntity,
  useNewComponent,
  useExistingComponentByType,
  useEntity,
  useCallbackAsCurrent,
  useStateAccumlator,
  useType,
};
export * from "./Hooks";
