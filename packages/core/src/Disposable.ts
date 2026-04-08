export interface IDisposable {
  dispose: () => void;
  [Symbol.dispose]: () => void;
}

// polyfill
if (!Object.getOwnPropertyDescriptor(Symbol, "dispose")) {
  Object.defineProperty(Symbol, "dispose", {
    value: Symbol("Symbol.dispose"),
    configurable: false,
    writable: false,
    enumerable: false,
  });
}

export class Disposable implements IDisposable {
  dispose: () => void;
  [Symbol.dispose]!: () => void;

  constructor(onDisposeCallback: () => void) {
    this.dispose = onDisposeCallback;
    this[Symbol.dispose] = onDisposeCallback;
  }
}
