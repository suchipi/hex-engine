import Entity from "./Entity";
import {
  Entity as EntityInterface,
  Component as ComponentInterface,
} from "./Interface";
import HooksSystem from "./HooksSystem";
import EnableDisableEntity from "./Components/EnableDisableEntity";
import RunLoop from "./Components/RunLoop";
import { useEntityLifecycle } from "./Components/EntityLifecycle";

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
    Object.defineProperty(fromCreateEntity, "name", {
      value: func.name || "from createEntity",
    });
    useType(fromCreateEntity);

    useNewComponent(EnableDisableEntity);
    return func();
  }
  return Entity._create(fromCreateEntity);
};

const Components = {
  EnableDisableEntity,
  RunLoop,
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
  useEntityLifecycle,
};
export * from "./Hooks";
