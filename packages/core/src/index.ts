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
  useType,
  useIsEnabled,
  useChild,
  useCurrentComponent,
} = HooksSystem.hooks;

/**
 * Create the root Entity for your game. Pass it a Component function.
 * @param componentFunction The first Component to add to the Entity.
 * This Component can add other Components as desired via `useNewComponent`.
 * @returns A new Entity instance.
 */
const createRoot = <T>(
  componentFunction: () => T
): EntityInterface & {
  rootComponent: T extends {} ? T & ComponentInterface : ComponentInterface;
} => {
  return Entity._create(componentFunction);
};

export {
  RunLoop,
  ErrorBoundary,
  EntityInterface as Entity,
  ComponentInterface as Component,
  createRoot,
  useNewComponent,
  useEntity,
  useCallbackAsCurrent,
  useType,
  useIsEnabled,
  useChild,
  useCurrentComponent,
};
export * from "./Hooks";
