import Component from "./Component";
import HooksSystem from "./HooksSystem";
import {
  Component as ComponentInterface,
  Entity as EntityInterface,
} from "./Interface";
import ErrorBoundary from "./Components/ErrorBoundary";
import proxyProperties from "./proxyProperties";

export default function instantiate<T>(
  componentFactory: () => T,
  entity: EntityInterface
): ComponentInterface & T {
  const instance = new Component(entity);

  const ret: unknown = HooksSystem.withInstance(instance, () => {
    try {
      return componentFactory();
    } catch (error) {
      Object.defineProperty(error, "message", {
        value: `Failed to instantiate ${entity.name || "unnamed entity"}: ${
          error.message
        }`,
      });

      ErrorBoundary.runHandlers(entity, error);

      return null;
    }
  });

  const api = {};
  proxyProperties(instance, api);
  if (typeof ret === "object" && ret != null) {
    proxyProperties(ret, api);
  }

  // @ts-ignore
  return api;
}
