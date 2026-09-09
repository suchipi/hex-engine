/// <reference types="@test-it/core/globals" />
import {
  CoreEventPhase,
  CoreEventType,
  Entity,
  createRoot,
  events,
  useChild,
  useNewComponent,
  useType,
} from "..";

let trace: Array<string> = [];
let registrations: Array<{ dispose: () => void }> = [];

/** Records every core event of the given types, until `afterEach` unhooks them. */
function watch(...eventTypes: Array<CoreEventType>) {
  for (const eventType of eventTypes) {
    for (const eventPhase of [CoreEventPhase.BEFORE, CoreEventPhase.AFTER]) {
      registrations.push(
        events.register(eventType, eventPhase, () => {
          trace.push(`${eventType} ${eventPhase}`);
        })
      );
    }
  }
}

beforeEach(() => {
  trace = [];
  registrations = [];
});

afterEach(() => {
  registrations.forEach((registration) => registration.dispose());
});

function Plain() {
  useType(Plain);
}

test("creating a root Entity emits ENTITY_CREATE around its Component's creation", () => {
  watch(CoreEventType.ENTITY_CREATE, CoreEventType.COMPONENT_CREATE);

  createRoot(Plain);

  expect(trace).toEqual([
    "ENTITY_CREATE BEFORE",
    "COMPONENT_CREATE BEFORE",
    "COMPONENT_CREATE AFTER",
    "ENTITY_CREATE AFTER",
  ]);
});

test("ENTITY_CREATE AFTER carries the finished Entity", () => {
  let seen: Entity | null = null;

  registrations.push(
    events.register(
      CoreEventType.ENTITY_CREATE,
      CoreEventPhase.AFTER,
      (event) => {
        seen = event.entity;
      }
    )
  );

  const root = createRoot(Plain);

  expect(seen).toBe(root);
});

test("ENTITY_CREATE BEFORE reports the parent, which is null for a root", () => {
  const parents: Array<Entity | null> = [];

  registrations.push(
    events.register(
      CoreEventType.ENTITY_CREATE,
      CoreEventPhase.BEFORE,
      (event) => {
        parents.push(event.parent);
      }
    )
  );

  let child!: Entity;
  const root = createRoot(function Root() {
    useType(Root);
    child = useChild(Plain);
  });

  expect(parents).toEqual([null, root]);
  expect(child.parent).toBe(root);
});

test("adding a Component emits COMPONENT_CREATE and then ENTITY_ADD_COMPONENT", () => {
  const root = createRoot(Plain);

  watch(CoreEventType.COMPONENT_CREATE, CoreEventType.ENTITY_ADD_COMPONENT);

  root.addComponent(Plain);

  expect(trace).toEqual([
    "COMPONENT_CREATE BEFORE",
    "COMPONENT_CREATE AFTER",
    "ENTITY_ADD_COMPONENT BEFORE",
    "ENTITY_ADD_COMPONENT AFTER",
  ]);
});

test("removing a Component emits ENTITY_REMOVE_COMPONENT around the removal", () => {
  let root!: Entity;
  const component = (root = createRoot(Plain)).addComponent(function Extra() {
    useType(Extra);
  });

  watch(CoreEventType.ENTITY_REMOVE_COMPONENT, CoreEventType.COMPONENT_DISABLE);

  root.removeComponent(component);

  // The Component is disabled first, from inside the BEFORE phase.
  expect(trace).toEqual([
    "ENTITY_REMOVE_COMPONENT BEFORE",
    "COMPONENT_DISABLE BEFORE",
    "COMPONENT_DISABLE AFTER",
    "ENTITY_REMOVE_COMPONENT AFTER",
  ]);
});

test("adding a child Entity emits ENTITY_ADD_CHILD before the child is built", () => {
  const root = createRoot(Plain);

  watch(CoreEventType.ENTITY_ADD_CHILD, CoreEventType.ENTITY_CREATE);

  root.createChild(Plain);

  // addChild runs before the child's Component function does, which is what
  // lets that function reach its parent through useRootEntity.
  expect(trace).toEqual([
    "ENTITY_CREATE BEFORE",
    "ENTITY_ADD_CHILD BEFORE",
    "ENTITY_ADD_CHILD AFTER",
    "ENTITY_CREATE AFTER",
  ]);
});

test("destroying an Entity emits ENTITY_DESTROY around the teardown", () => {
  let child!: Entity;
  createRoot(function Root() {
    useType(Root);
    child = useChild(Plain);
  });

  watch(
    CoreEventType.ENTITY_DESTROY,
    CoreEventType.ENTITY_DISABLE,
    CoreEventType.ENTITY_REMOVE_CHILD
  );

  child.destroy();

  expect(trace).toEqual([
    "ENTITY_DESTROY BEFORE",
    "ENTITY_DISABLE BEFORE",
    "ENTITY_DISABLE AFTER",
    "ENTITY_REMOVE_CHILD BEFORE",
    "ENTITY_REMOVE_CHILD AFTER",
    "ENTITY_DESTROY AFTER",
  ]);
});

test("destroying a parent emits ENTITY_DESTROY for its children first", () => {
  const destroyed: Array<string> = [];
  let parent!: Entity;

  createRoot(function Root() {
    useType(Root);

    parent = useChild(function Parent() {
      useType(Parent);
      useChild(function Kid() {
        useType(Kid);
      });
    });
  });

  registrations.push(
    events.register(
      CoreEventType.ENTITY_DESTROY,
      CoreEventPhase.AFTER,
      (event) => {
        destroyed.push(event.entity.name || "unnamed");
      }
    )
  );

  parent.destroy();

  expect(destroyed).toEqual(["Kid", "Parent"]);
});

test("enabling and disabling a Component emits COMPONENT_ENABLE and COMPONENT_DISABLE", () => {
  let component!: ReturnType<typeof createRoot>["rootComponent"];

  const root = createRoot(Plain);
  component = root.rootComponent;

  watch(CoreEventType.COMPONENT_ENABLE, CoreEventType.COMPONENT_DISABLE);

  component.disable();
  component.enable();

  expect(trace).toEqual([
    "COMPONENT_DISABLE BEFORE",
    "COMPONENT_DISABLE AFTER",
    "COMPONENT_ENABLE BEFORE",
    "COMPONENT_ENABLE AFTER",
  ]);
});

test("enabling and disabling an Entity emits ENTITY_ENABLE and ENTITY_DISABLE", () => {
  const root = createRoot(Plain);

  watch(CoreEventType.ENTITY_ENABLE, CoreEventType.ENTITY_DISABLE);

  root.disable();
  root.enable();

  expect(trace).toEqual([
    "ENTITY_DISABLE BEFORE",
    "ENTITY_DISABLE AFTER",
    "ENTITY_ENABLE BEFORE",
    "ENTITY_ENABLE AFTER",
  ]);
});

test("a Component created from inside another emits its events nested", () => {
  watch(CoreEventType.COMPONENT_CREATE, CoreEventType.ENTITY_ADD_COMPONENT);

  createRoot(function Root() {
    useType(Root);
    useNewComponent(Plain);
  });

  expect(trace).toEqual([
    // The root Component starts building...
    "COMPONENT_CREATE BEFORE",
    // ...and the one it creates finishes entirely inside it...
    "COMPONENT_CREATE BEFORE",
    "COMPONENT_CREATE AFTER",
    "ENTITY_ADD_COMPONENT BEFORE",
    "ENTITY_ADD_COMPONENT AFTER",
    "COMPONENT_CREATE AFTER",
    // ...and only then is the root Component itself added.
    "ENTITY_ADD_COMPONENT BEFORE",
    "ENTITY_ADD_COMPONENT AFTER",
  ]);
});

test("a root Component is announced with ENTITY_ADD_COMPONENT like any other", () => {
  watch(CoreEventType.ENTITY_ADD_COMPONENT);

  const root = createRoot(Plain);

  expect(root.components.has(root.rootComponent)).toBe(true);
  expect(trace).toEqual([
    "ENTITY_ADD_COMPONENT BEFORE",
    "ENTITY_ADD_COMPONENT AFTER",
  ]);
});

test("ENTITY_ADD_COMPONENT for a root Component carries that Component", () => {
  let seen: unknown = null;

  registrations.push(
    events.register(
      CoreEventType.ENTITY_ADD_COMPONENT,
      CoreEventPhase.AFTER,
      (event) => {
        seen = event.component;
      }
    )
  );

  const root = createRoot(Plain);

  expect(seen).toBe(root.rootComponent);
});
