import Component from "./Component";
import HooksSystem from "./HooksSystem";
import {
  Component as ComponentInterface,
  Entity as EntityInterface,
} from "./Interface";

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
  componentFunc: (...args: any[]) => T,
  componentFactory: () => T,
  entity: EntityInterface
): ComponentInterface & T {
  const instance = new Component(componentFunc, entity);

  const ret: unknown = HooksSystem.withInstance(instance, () => {
    return componentFactory();
  });

  const api = {};
  if (typeof ret === "object" && ret != null) {
    proxyProperties(ret, api);
  }
  proxyProperties(instance, api);

  // @ts-ignore
  return api;
}
