/// <reference types="@test-it/core/globals" />
import {
  Component,
  Entity,
  createRoot,
  useChild,
  useEntity,
  useNewComponent,
  useType,
} from "..";

function Marker(label: string) {
  useType(Marker);
  return { label };
}

function Other(label: string) {
  useType(Other);
  return { label };
}

function Untyped() {
  return { untyped: true };
}

test("createRoot returns an Entity whose rootComponent is the one it was given", () => {
  const root = createRoot(function Root() {
    useType(Root);
    return { greeting: "hi" };
  });

  expect(root.parent).toBe(null);
  expect(root.rootComponent.greeting).toBe("hi");
  expect(root.components.has(root.rootComponent)).toBe(true);
});

test("Entity ids increase as Entities are created", () => {
  let first!: Entity;
  let second!: Entity;

  const root = createRoot(function Root() {
    useType(Root);
    first = useChild(function A() {
      useType(A);
    });
    second = useChild(function B() {
      useType(B);
    });
  });

  expect(first.id).toBeGreaterThan(root.id);
  expect(second.id).toBeGreaterThan(first.id);
});

test("useChild links parent and child both ways", () => {
  let child!: Entity;

  const root = createRoot(function Root() {
    useType(Root);
    child = useChild(function Kid() {
      useType(Kid);
    });
  });

  expect(child.parent).toBe(root);
  expect([...root.children]).toEqual([child]);
});

test("descendants lists every child before recursing into them", () => {
  let a!: Entity;
  let b!: Entity;
  let aa!: Entity;
  let ab!: Entity;

  const root = createRoot(function Root() {
    useType(Root);

    a = useChild(function A() {
      useType(A);

      aa = useChild(function AA() {
        useType(AA);
      });
      ab = useChild(function AB() {
        useType(AB);
      });
    });

    b = useChild(function B() {
      useType(B);
    });
  });

  expect(root.descendants()).toEqual([a, b, aa, ab]);
  expect(a.descendants()).toEqual([aa, ab]);
  expect(b.descendants()).toEqual([]);
});

test("ancestors are ordered from the root down to the immediate parent", () => {
  let deepest!: Entity;
  let middle!: Entity;

  const root = createRoot(function Root() {
    useType(Root);

    middle = useChild(function Middle() {
      useType(Middle);

      deepest = useChild(function Deepest() {
        useType(Deepest);
      });
    });
  });

  expect(deepest.ancestors()).toEqual([root, middle]);
  expect(middle.ancestors()).toEqual([root]);
  expect(root.ancestors()).toEqual([]);
});

test("addChild refuses an Entity that already has a parent", () => {
  let child!: Entity;
  let other!: Entity;

  createRoot(function Root() {
    useType(Root);

    child = useChild(function Kid() {
      useType(Kid);
    });
    other = useChild(function Other2() {
      useType(Other2);
    });
  });

  expect(() => other.addChild(child)).toThrowError(
    /already had a parent|takeChild/
  );
});

test("takeChild moves an Entity from one parent to another", () => {
  let child!: Entity;
  let newParent!: Entity;
  let oldParent!: Entity;

  createRoot(function Root() {
    useType(Root);

    oldParent = useChild(function Old() {
      useType(Old);
    });
    newParent = useChild(function New() {
      useType(New);
    });
  });

  child = oldParent.createChild(function Kid() {
    useType(Kid);
  });

  newParent.takeChild(child);

  expect(child.parent).toBe(newParent);
  expect([...oldParent.children]).toEqual([]);
  expect([...newParent.children]).toEqual([child]);
});

test("removeChild refuses an Entity that is not this Entity's child", () => {
  let a!: Entity;
  let b!: Entity;

  createRoot(function Root() {
    useType(Root);

    a = useChild(function A() {
      useType(A);
    });
    b = useChild(function B() {
      useType(B);
    });
  });

  expect(() => a.removeChild(b)).toThrowError(/wasn't the child's parent/);
});

test("getComponent finds a Component by the type it registered", () => {
  let entity!: Entity;

  createRoot(function Root() {
    useType(Root);

    entity = useChild(function Kid() {
      useType(Kid);
      useNewComponent(() => Marker("only"));
    });
  });

  expect(entity.getComponent(Marker)!.label).toBe("only");
  expect(entity.hasComponent(Marker)).toBe(true);
  expect(entity.getComponent(Other)).toBe(null);
  expect(entity.hasComponent(Other)).toBe(false);
});

test("known quirk: with two Components of one type, getComponent returns the last added", () => {
  let entity!: Entity;

  createRoot(function Root() {
    useType(Root);

    entity = useChild(function Kid() {
      useType(Kid);
      useNewComponent(() => Marker("first"));
      useNewComponent(() => Marker("second"));
    });
  });

  // getComponent builds a Map keyed by type, so later entries win and the
  // earlier Component is unreachable through the entity's public API.
  expect(entity.getComponent(Marker)!.label).toBe("second");
});

test("a Component that never calls useType cannot be found", () => {
  let entity!: Entity;

  createRoot(function Root() {
    useType(Root);

    entity = useChild(function Kid() {
      useType(Kid);
      useNewComponent(Untyped);
    });
  });

  expect(entity.hasComponent(Untyped)).toBe(false);
  expect(entity.getComponent(Untyped)).toBe(null);
});

test("Components created from inside a Component are added before it", () => {
  let entity!: Entity;

  createRoot(function Root() {
    useType(Root);

    entity = useChild(function Outer() {
      useType(Outer);

      useNewComponent(function Wrapper() {
        useType(Wrapper);
        useNewComponent(() => Marker("inner"));
      });
    });
  });

  const types = [...entity.components].map((component) =>
    component.type ? component.type.name : "?"
  );

  // addComponent instantiates first and adds afterward, so anything a Component
  // creates during its own construction lands ahead of it.
  expect(types).toEqual(["Marker", "Wrapper", "Outer"]);
});

test("addComponent adds a Component to an existing Entity", () => {
  let entity!: Entity;

  createRoot(function Root() {
    useType(Root);

    entity = useChild(function Kid() {
      useType(Kid);
    });
  });

  const added = entity.addComponent(() => Marker("added"));

  expect(entity.getComponent(Marker)).toBe(added);
  expect(added.label).toBe("added");
});

test("removeComponent disables the Component and takes it off the Entity", () => {
  const calls: Array<string> = [];
  let entity!: Entity;
  let component!: Component;

  createRoot(function Root() {
    useType(Root);

    entity = useChild(function Kid() {
      useType(Kid);

      component = useNewComponent(function Removable() {
        useType(Removable);
        useNewComponent(() => Marker("kept"));
      });
    });
  });

  entity.removeComponent(component);

  expect(entity.components.has(component)).toBe(false);
  expect(component.isEnabled).toBe(false);
  expect(calls).toEqual([]);
  // Components it created during construction are left where they are.
  expect(entity.getComponent(Marker)).not.toBe(null);
});

test("removing a Component that is not on the Entity does nothing", () => {
  let entity!: Entity;
  let foreign!: Component;

  createRoot(function Root() {
    useType(Root);

    foreign = useNewComponent(() => Marker("root's"));

    entity = useChild(function Kid() {
      useType(Kid);
    });
  });

  entity.removeComponent(foreign);

  expect(foreign.isEnabled).toBe(true);
});

test("useEntity returns the Entity the Component was put on", () => {
  let fromHook!: Entity;
  let entity!: Entity;

  createRoot(function Root() {
    useType(Root);

    entity = useChild(function Kid() {
      useType(Kid);

      useNewComponent(function Inner() {
        useType(Inner);
        fromHook = useEntity();
      });
    });
  });

  expect(fromHook).toBe(entity);
});

test("createChild attaches to the Entity it is called on, not the current one", () => {
  let target!: Entity;

  const root = createRoot(function Root() {
    useType(Root);

    target = useChild(function Target() {
      useType(Target);
    });
  });

  const child = target.createChild(function Kid() {
    useType(Kid);
  });

  expect(child.parent).toBe(target);
  expect(root.descendants()).toEqual([target, child]);
});
