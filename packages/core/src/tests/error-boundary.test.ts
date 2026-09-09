/// <reference types="@test-it/core/globals" />
import {
  Component,
  ErrorBoundary,
  createRoot,
  useChild,
  useNewComponent,
  useType,
} from "..";

let caught: Array<string> = [];
let logged: Array<unknown> = [];
let realConsoleError: typeof console.error;

beforeEach(() => {
  caught = [];
  logged = [];
  realConsoleError = console.error;
  console.error = (...args: Array<unknown>) => {
    logged.push(args[0]);
  };
});

afterEach(() => {
  console.error = realConsoleError;
});

function Boundary(label: string) {
  useType(Boundary);

  return ErrorBoundary((error) => {
    caught.push(`${label}: ${error.message}`);
  });
}

function Exploding(): { never: true } {
  useType(Exploding);
  throw new Error("boom");
}

test("an error thrown while building a Component is caught, not propagated", () => {
  expect(() => {
    createRoot(function Root() {
      useType(Root);
      useNewComponent(Boundary.bind(null, "root"));
      useNewComponent(Exploding);
    });
  }).not.toThrowError();

  expect(caught).toEqual(["root: Failed to instantiate Root: boom"]);
});

test("the error message names the Entity that failed", () => {
  createRoot(function Root() {
    useType(Root);
    useNewComponent(Boundary.bind(null, "root"));

    useChild(function Kid() {
      useType(Kid);
      useNewComponent(Exploding);
    });
  });

  expect(caught).toEqual(["root: Failed to instantiate Kid: boom"]);
});

test("an ErrorBoundary on an ancestor catches a descendant's error", () => {
  createRoot(function Root() {
    useType(Root);
    useNewComponent(Boundary.bind(null, "root"));

    useChild(function Middle() {
      useType(Middle);

      useChild(function Deepest() {
        useType(Deepest);
        useNewComponent(Exploding);
      });
    });
  });

  expect(caught).toEqual(["root: Failed to instantiate Deepest: boom"]);
});

test("the nearest ErrorBoundary wins", () => {
  createRoot(function Root() {
    useType(Root);
    useNewComponent(Boundary.bind(null, "root"));

    useChild(function Middle() {
      useType(Middle);
      useNewComponent(Boundary.bind(null, "middle"));

      useChild(function Deepest() {
        useType(Deepest);
        useNewComponent(Exploding);
      });
    });
  });

  expect(caught).toEqual(["middle: Failed to instantiate Deepest: boom"]);
});

test("an ErrorBoundary added before the failing Component catches on its own Entity", () => {
  createRoot(function Root() {
    useType(Root);
    useNewComponent(Boundary.bind(null, "same-entity"));
    useNewComponent(Exploding);
  });

  expect(caught).toEqual(["same-entity: Failed to instantiate Root: boom"]);
});

test("an ErrorBoundary added after the failing Component is too late to catch it", () => {
  createRoot(function Root() {
    useType(Root);
    useNewComponent(Exploding);
    useNewComponent(Boundary.bind(null, "too-late"));
  });

  expect(caught).toEqual([]);
  expect(logged.length).toBe(1);
});

test("with no ErrorBoundary anywhere, the error is logged", () => {
  createRoot(function Root() {
    useType(Root);
    useNewComponent(Exploding);
  });

  expect(caught).toEqual([]);
  expect(logged.length).toBe(1);
  expect((logged[0] as Error).message).toBe("Failed to instantiate Root: boom");
});

test("when a handler throws, the next ancestor receives what the handler threw", () => {
  createRoot(function Root() {
    useType(Root);
    useNewComponent(Boundary.bind(null, "outer"));

    useChild(function Middle() {
      useType(Middle);

      useNewComponent(function RethrowingBoundary() {
        useType(RethrowingBoundary);

        return ErrorBoundary(() => {
          throw new Error("handler failed");
        });
      });

      useChild(function Deepest() {
        useType(Deepest);
        useNewComponent(Exploding);
      });
    });
  });

  expect(caught).toEqual(["outer: handler failed"]);
});

test("if a throwing handler is the last one, what it threw is what gets logged", () => {
  createRoot(function Root() {
    useType(Root);

    useNewComponent(function RethrowingBoundary() {
      useType(RethrowingBoundary);

      return ErrorBoundary(() => {
        throw new Error("handler failed");
      });
    });

    useNewComponent(Exploding);
  });

  expect(logged.length).toBe(1);
  expect((logged[0] as Error).message).toBe("handler failed");
});

test("a Component whose function throws is still added to the Entity", () => {
  let component!: Component;

  const root = createRoot(function Root() {
    useType(Root);
    useNewComponent(Boundary.bind(null, "root"));
    component = useNewComponent(Exploding);
  });

  expect(root.components.has(component)).toBe(true);
  expect(component.isEnabled).toBe(true);
  // The Component function never got to return, so nothing was proxied onto it.
  expect((component as { never?: true }).never).toBe(undefined);
});

test("useType still applies when the Component function throws afterward", () => {
  const root = createRoot(function Root() {
    useType(Root);
    useNewComponent(Boundary.bind(null, "root"));
    useNewComponent(Exploding);
  });

  expect(root.hasComponent(Exploding)).toBe(true);
});

test("an error in one Component does not stop the ones after it", () => {
  const built: Array<string> = [];

  createRoot(function Root() {
    useType(Root);
    useNewComponent(Boundary.bind(null, "root"));

    useNewComponent(Exploding);

    useNewComponent(function After() {
      useType(After);
      built.push("after");
    });
  });

  expect(built).toEqual(["after"]);
  expect(caught.length).toBe(1);
});
