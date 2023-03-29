import Entity from "./Entity";
// Note: these eslint disables are here so that they can end up in the
// generated dist code, to prevent the user-facing eslint config from
// complaining that these things aren't importable (since they're
// types, not values).
import {
  // eslint-disable-next-line
  Entity as EntityInterface,
  // eslint-disable-next-line
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
  useChild,
  useCurrentComponent,
};
export * from "./Hooks";
