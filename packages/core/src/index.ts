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

const createEntity = (func: (...args: any[]) => any): EntityInterface => {
  function BaseEntityLogic() {
    useNewComponent(Components.EnableDisableEntity, () =>
      Components.EnableDisableEntity()
    );
    return useNewComponent(func, func);
  }

  return Entity._create(BaseEntityLogic, () => BaseEntityLogic());
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
