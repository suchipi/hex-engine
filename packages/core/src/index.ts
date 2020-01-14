import Entity from "./Entity";
import {
  Entity as EntityInterface,
  Component as ComponentInterface,
} from "./Interface";
import HooksSystem from "./HooksSystem";
import RunLoop from "./Components/RunLoop";
import ErrorBoundary from "./Components/ErrorBoundary";

const {
  useNewComponent,
  useEntity,
  useCallbackAsCurrent,
  useStateAccumulator,
  useType,
  useIsEnabled,
  useChild,
} = HooksSystem.hooks;

const createEntityWithComponent = <T>(
  componentFactory: () => T
): EntityInterface & {
  api: T extends {} ? T & ComponentInterface : ComponentInterface;
} => {
  return Entity._create(componentFactory);
};

export {
  RunLoop,
  ErrorBoundary,
  EntityInterface as Entity,
  ComponentInterface as Component,
  createEntityWithComponent,
  useNewComponent,
  useEntity,
  useCallbackAsCurrent,
  useStateAccumulator,
  useType,
  useIsEnabled,
  useChild,
};
export * from "./Hooks";
