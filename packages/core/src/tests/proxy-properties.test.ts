/// <reference types="@test-it/core/globals" />
import {
  Component,
  Entity,
  ErrorBoundary,
  createRoot,
  useNewComponent,
  useType,
} from "..";

/** Builds a Component whose function returns `makeReturnValue()`, and hands back both halves. */
function componentReturning<T>(makeReturnValue: () => T) {
  let original!: T;
  let component!: T extends {} ? T & Component : Component;
  let entity!: Entity;

  createRoot(function Root() {
    useType(Root);

    component = useNewComponent(function Subject() {
      useType(Subject);
      original = makeReturnValue();
      return original;
    });
    entity = component.entity;
  });

  return { original, component, entity };
}

test("plain properties on the returned object are readable through the Component", () => {
  const { component } = componentReturning(() => ({
    count: 3,
    label: "hello",
  }));

  expect(component.count).toBe(3);
  expect(component.label).toBe("hello");
});

test("writes through the Component reach the returned object", () => {
  const { component, original } = componentReturning(() => ({ count: 3 }));

  component.count = 10;

  expect(original.count).toBe(10);
  expect(component.count).toBe(10);
});

test("writes to the returned object are visible through the Component", () => {
  const { component, original } = componentReturning(() => ({ count: 3 }));

  original.count = 7;

  expect(component.count).toBe(7);
});

test("getters on the returned object are re-run on every read", () => {
  let reads = 0;

  const { component } = componentReturning(() => ({
    get counter() {
      reads++;
      return reads;
    },
  }));

  const before = reads;
  expect(component.counter).toBe(before + 1);
  expect(component.counter).toBe(before + 2);
});

test("setters on the returned object are called when writing through the Component", () => {
  const written: Array<number> = [];

  const { component } = componentReturning(() => ({
    set value(next: number) {
      written.push(next);
    },
  }));

  component.value = 42;

  expect(written).toEqual([42]);
});

test("methods inherited from a class prototype are forwarded", () => {
  class Greeter {
    greeting = "hello";
    greet() {
      return this.greeting;
    }
  }

  const { component } = componentReturning(() => new Greeter());

  expect(component.greet()).toBe("hello");
});

test("known quirk: a forwarded method's `this` is the Component, not the returned object", () => {
  class SelfReturner {
    value = 1;
    getSelf(): unknown {
      return this;
    }
  }

  const { component, original } = componentReturning(() => new SelfReturner());

  // proxyProperties forwards property *reads*, so the method is fetched from
  // the original but invoked with the Component as its receiver. Field access
  // inside still works, but only because every field is forwarded too.
  expect(component.getSelf()).toBe(component);
  expect(component.getSelf()).not.toBe(original);
});

test("known quirk: properties added after the Component function returns are not forwarded", () => {
  const { component, original } = componentReturning(
    () => ({ existing: 1 } as { existing: number; added?: number })
  );

  original.added = 2;

  // proxyProperties walks the returned object once, at construction.
  expect(original.added).toBe(2);
  expect(component.added).toBe(undefined);
});

/** Builds a Component returning `makeReturnValue()` and reports the error it caused. */
function errorFromReturning(makeReturnValue: () => unknown): string {
  let message = "";

  createRoot(function Root() {
    useType(Root);

    useNewComponent(function ErrorReporter() {
      useType(ErrorReporter);
      return ErrorBoundary((error) => {
        message = error.message;
      });
    });

    useNewComponent(function Subject() {
      useType(Subject);
      return makeReturnValue();
    });
  });

  return message;
}

test("returning a property the Component needs for itself is an error", () => {
  for (const name of [
    "_kind",
    "type",
    "entity",
    "isEnabled",
    "enable",
    "disable",
  ]) {
    expect(errorFromReturning(() => ({ [name]: "clobbered" }))).toMatch(
      new RegExp(`Subject.*'${name}'`)
    );
  }
});

test("the error names every conflicting property at once", () => {
  expect(errorFromReturning(() => ({ type: 1, entity: 2, keep: 3 }))).toMatch(
    /'type', 'entity'/
  );
});

test("a conflict inherited from a prototype is caught too", () => {
  class Sneaky {
    get isEnabled() {
      return true;
    }
  }

  expect(errorFromReturning(() => new Sneaky())).toMatch(/'isEnabled'/);
});

test("a Component that returns a conflicting object gets nothing proxied onto it", () => {
  let component!: Component;

  createRoot(function Root() {
    useType(Root);

    useNewComponent(function Boundary() {
      useType(Boundary);
      return ErrorBoundary(() => {});
    });

    component = useNewComponent(function Subject() {
      useType(Subject);
      return { type: "clobbered", keep: "mine" };
    });
  });

  expect(component.isEnabled).toBe(true);
  expect(component.type!.name).toBe("Subject");
  expect((component as { keep?: string }).keep).toBe(undefined);
});

test("a returned object that avoids those names is fine", () => {
  const { component } = componentReturning(() => ({
    kind: "mine",
    typeName: "mine",
    owner: "mine",
    start: () => "mine",
  }));

  expect(component.kind).toBe("mine");
  expect(component.isEnabled).toBe(true);
  expect(component.type!.name).toBe("Subject");
});

test("returning a non-object leaves the Component interface alone", () => {
  let component!: Component;

  createRoot(function Root() {
    useType(Root);

    component = useNewComponent(function Subject() {
      useType(Subject);
      return 42;
    });
  });

  expect(component.isEnabled).toBe(true);
  expect(component.type!.name).toBe("Subject");
});

test("returning nothing leaves the Component interface alone", () => {
  let component!: Component;

  createRoot(function Root() {
    useType(Root);

    component = useNewComponent(function Subject() {
      useType(Subject);
    });
  });

  expect(component.isEnabled).toBe(true);
  expect(component.type!.name).toBe("Subject");
});

test("returning null leaves the Component interface alone", () => {
  let component!: Component;

  createRoot(function Root() {
    useType(Root);

    component = useNewComponent(function Subject() {
      useType(Subject);
      return null;
    });
  });

  expect(component.isEnabled).toBe(true);
  expect(component.type!.name).toBe("Subject");
});

test("known quirk: symbol-keyed properties are not forwarded", () => {
  const key = Symbol("secret");

  const { component, original } = componentReturning(() => ({
    [key]: "hidden",
    visible: "shown",
  }));

  expect(original[key]).toBe("hidden");
  expect(component.visible).toBe("shown");
  // gatherPropertyNames uses Object.getOwnPropertyNames, which skips symbols.
  expect((component as unknown as { [key: symbol]: unknown })[key]).toBe(
    undefined
  );
});
