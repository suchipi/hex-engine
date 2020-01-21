/**
 * Gathers all the property names on `obj` and its prototypical parents,
 * by looking up the tree.
 * @param obj The object you want the property names of
 */
function gatherPropertyNames(obj: Object, soFar: Set<string> = new Set()) {
  const proto = Object.getPrototypeOf(obj);
  if (proto && proto !== Object.prototype) {
    gatherPropertyNames(proto, soFar);
  }

  Object.getOwnPropertyNames(obj).forEach((name) => soFar.add(name));
  return soFar;
}

/**
 * Creates getters and setters on `proxy` for every property on `original`,
 * that forward to the cooresponding properties on `original`.
 * @param original The object you want to forward to
 * @param proxy The object where you want to create the getters/setters.
 */
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
