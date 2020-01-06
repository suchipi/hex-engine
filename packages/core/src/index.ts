import Entity from "./Entity";
import {
  Entity as EntityInterface,
  Component as ComponentInterface,
} from "./Interface";
import HooksSystem from "./HooksSystem";
import RunLoop from "./Components/RunLoop";
import { useEntityLifecycle } from "./Components/EntityLifecycle";

const {
  useNewComponent,
  useExistingComponentByType,
  useEntity,
  useCallbackAsCurrent,
  useStateAccumlator,
  useType,
  useIsEnabled,
} = HooksSystem.hooks;

const createEntity = (func: () => any): EntityInterface => {
  function fromCreateEntity() {
    Object.defineProperty(fromCreateEntity, "name", {
      value: func.name || "from createEntity",
    });
    useType(fromCreateEntity);

    return func();
  }
  return Entity._create(fromCreateEntity);
};

export {
  RunLoop,
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
  useIsEnabled,
};
export * from "./Hooks";
