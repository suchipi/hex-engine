function gatherPropertyNames(obj: Object, soFar: Set<string> = new Set()) {
  const proto = Object.getPrototypeOf(obj);
  if (proto && proto !== Object.prototype) {
    gatherPropertyNames(proto, soFar);
  }

  Object.getOwnPropertyNames(obj).forEach((name) => soFar.add(name));
  return soFar;
}

export default function proxyProperties(original: Object, proxy: Object) {
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
