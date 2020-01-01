import Entity from "./Entity";
import {
  Entity as EntityInterface,
  Component as ComponentInterface,
} from "./Interface";
import HooksSystem from "./HooksSystem";
import * as Components from "./Components";

const {
  useNewComponent,
  useExistingComponent,
  useEntity,
  useCallbackAsCurrent,
  useStateAccumlator,
} = HooksSystem.hooks;

// @ts-ignore
const createEntity: typeof Entity._create = (func, arg) => {
  return Entity._create(function BaseEntityLogic() {
    useNewComponent(Components.EnableDisableEntity);
    // @ts-ignore
    return useNewComponent(func, arg);
  });
};

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
