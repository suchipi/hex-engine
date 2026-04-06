export interface Disposable {
  dispose: () => void;
  // [Symbol.dispose]: () => void;
}

export function makeDisposable(disposeFunction: () => void): Disposable {
  const disposable = {
    dispose: disposeFunction,
  };

  if ("dispose" in Symbol && typeof Symbol.dispose === "symbol") {
    disposable[Symbol.dispose] = disposeFunction;
  }

  return disposable;
}
