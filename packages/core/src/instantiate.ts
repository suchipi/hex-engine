import Component from "./Component";
import HooksSystem from "./HooksSystem";
import {
  Component as ComponentInterface,
  Entity as EntityInterface,
} from "./Interface";
import ErrorBoundary from "./Components/ErrorBoundary";
import proxyProperties from "./proxyProperties";
import { CoreEventPhase, CoreEventType, events } from "./CoreEvents";

/**
 * Property names that a Component instance needs for itself. proxyProperties
 * would quietly redefine these to point at the Component function's return
 * value, leaving the Component unable to be found, disabled, or linked to its
 * Entity.
 */
const RESERVED_PROPERTY_NAMES = [
  "_kind",
  "type",
  "entity",
  "isEnabled",
  "enable",
  "disable",
];

function assertNoReservedProperties(
  returnValue: unknown,
  componentFunction: Function
) {
  if (typeof returnValue !== "object" || returnValue == null) return;

  const conflicts = RESERVED_PROPERTY_NAMES.filter(
    (name) => name in returnValue
  );
  if (conflicts.length === 0) return;

  throw new Error(
    `${
      componentFunction.name || "A Component function"
    } returned an object with ${conflicts
      .map((name) => `'${name}'`)
      .join(
        ", "
      )} on it, but those names are used by the Component itself. Please rename them.`
  );
}

/**
 * Internal Component instantiation function. Takes care of
 * creating a Component instance for the provided Component function,
 * and adding it to the provided Entity.
 *
 * Note that the Component instance is added to the Entity *before*
 * the Component function is called, so `useEntity` will always return
 * a value.
 *
 * This function returns an object that implements the Component interface
 * as well as the interface of the return type of your Component function,
 * as long as it's an Object. It does this by defining getter/setters that
 * proxy reads and writes for those properties to the appropriate object:
 * Either the Component instance or the return value of the Component function.
 * @param componentFunction The Component function to call.
 * @param entity The Entity to put the new Component instance on.
 */
export default function instantiate<T>(
  componentFunction: () => T,
  entity: EntityInterface
): T extends {} ? T & ComponentInterface : ComponentInterface {
  events.emit({
    eventType: CoreEventType.COMPONENT_CREATE,
    eventPhase: CoreEventPhase.BEFORE,
    componentFactory: componentFunction,
    entity,
  });

  const instance = new Component(entity);

  const ret: unknown = HooksSystem.withInstance(instance, () => {
    try {
      const returnValue = componentFunction();
      // Checked in here so that a bad return value is reported through the same
      // path as any other mistake a Component function makes.
      assertNoReservedProperties(returnValue, componentFunction);
      return returnValue;
    } catch (_error) {
      const error = _error as any;
      Object.defineProperty(error, "message", {
        value: `Failed to instantiate ${entity.name || "unnamed entity"}: ${
          error.message
        }`,
      });

      ErrorBoundary.runHandlers(entity, error);

      return null;
    }
  });

  if (typeof ret === "object" && ret != null) {
    proxyProperties(ret, instance);
  }

  events.emit({
    eventType: CoreEventType.COMPONENT_CREATE,
    eventPhase: CoreEventPhase.AFTER,
    componentFactory: componentFunction,
    entity,
    component: instance,
  });

  // @ts-ignore
  return instance;
}
