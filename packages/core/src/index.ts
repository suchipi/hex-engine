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
  useExistingComponentByType,
  useEntity,
  useCallbackAsCurrent,
  useStateAccumlator,
  useType,
  useIsEnabled,
  useChild,
} = HooksSystem.hooks;

const renderRootComponent = (componentFactory: () => any) => {
  return Entity._create(componentFactory);
};

export {
  RunLoop,
  ErrorBoundary,
  EntityInterface as Entity,
  ComponentInterface as Component,
  renderRootComponent,
  useNewComponent,
  useExistingComponentByType,
  useEntity,
  useCallbackAsCurrent,
  useStateAccumlator,
  useType,
  useIsEnabled,
  useChild,
};
export * from "./Hooks";
