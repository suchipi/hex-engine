import Component from "./Component";
import HooksSystem from "./HooksSystem";
import {
  Component as ComponentInterface,
  Entity as EntityInterface,
} from "./Interface";
import ErrorBoundary from "./Components/ErrorBoundary";

function gatherPropertyNames(obj: Object, soFar: Set<string> = new Set()) {
  const proto = Object.getPrototypeOf(obj);
  if (proto && proto !== Object.prototype) {
    gatherPropertyNames(proto, soFar);
  }

  Object.getOwnPropertyNames(obj).forEach((name) => soFar.add(name));
  return soFar;
}

function proxyProperties(original: Object, proxy: Object) {
  const names = gatherPropertyNames(original);
  for (const name of names) {
    Object.defineProperty(proxy, name, {
      configurable: true,
      get() {
        // @ts-ignore
        return original[name];
      },
      set(nextVal) {
        // @ts-ignore
        original[name] = nextVal;
      },
    });
  }
}

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
