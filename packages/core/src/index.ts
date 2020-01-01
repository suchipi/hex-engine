import Entity from "./Entity";
import {
  Entity as EntityInterface,
  Component as ComponentInterface,
} from "./Interface";
import HooksSystem from "./HooksSystem";
import * as Components from "./Components";

const createEntity: typeof Entity._create = (...args) => {
  return Entity._create(...args);
};

const {
  useNewComponent,
  useExistingComponent,
  useEntity,
  useCallbackAsCurrent,
  useStateAccumlator,
} = HooksSystem.hooks;

export {
  Components,
  EntityInterface as Entity,
  ComponentInterface as Component,
  createEntity,
  useNewComponent,
  useExistingComponent,
  useEntity,
  useCallbackAsCurrent,
  useStateAccumlator,
};
export * from "./Hooks";
