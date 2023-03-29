import Component from "./Component";
import HooksSystem from "./HooksSystem";
import {
  Component as ComponentInterface,
  Entity as EntityInterface,
} from "./Interface";
import ErrorBoundary from "./Components/ErrorBoundary";
import proxyProperties from "./proxyProperties";

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
  const instance = new Component(entity);

  const ret: unknown = HooksSystem.withInstance(instance, () => {
    try {
      return componentFunction();
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

  // @ts-ignore
  return instance;
}
