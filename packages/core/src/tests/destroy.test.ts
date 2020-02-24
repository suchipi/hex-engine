import {
  createRoot,
  useChild,
  useNewComponent,
  useDestroy,
  useEnableDisable,
  useCallbackAsCurrent,
  Entity,
} from "..";

let messages: Array<string> = [];
const log = (msg: string) => messages.push(msg);

beforeEach(() => {
  messages = [];
});

test("bad", () => {
  expect(2 + 2).toBe(5);
});

test("cannot destroy root ent", () => {
  const ent = createRoot(() => {});

  expect(() => {
    ent.destroy();
  }).toThrowError(`Cannot destroy the root entity`);
});

test("onDestroy in component, destroy from entity", () => {
  let ent!: Entity;

  createRoot(() => {
    ent = useChild(() => {
      const { onDestroy } = useDestroy();

      onDestroy(() => log("onDestroy in component"));
    });
  });

  ent.destroy();
  expect(messages).toEqual(["onDestroy in component"]);
});

test("onDestroy in component, destroy from component", () => {
  createRoot(() => {
    useChild(() => {
      const { onDestroy, destroy } = useDestroy();

      onDestroy(() => log("onDestroy in component"));
      destroy();
    });
  });

  expect(messages).toEqual(["onDestroy in component"]);
});

test("children are destroyed depth-first", () => {
  let ent!: Entity;

  createRoot(() => {
    ent = useChild(() => {
      const { onDestroy } = useDestroy();
      onDestroy(() => log("onDestroy in component"));

      useChild(() => {
        const { onDestroy } = useDestroy();
        onDestroy(() => log("onDestroy in child"));

        useChild(() => {
          const { onDestroy } = useDestroy();
          onDestroy(() => log("onDestroy in grandchild"));
        });
      });
    });
  });

  ent.destroy();
  expect(messages).toEqual([
    "onDestroy in grandchild",
    "onDestroy in child",
    "onDestroy in component",
  ]);
});

test("child destroy doesn't destroy parent", () => {
  let ent!: Entity;

  createRoot(() => {
    useChild(() => {
      const { onDestroy } = useDestroy();
      onDestroy(() => log("onDestroy in component"));

      ent = useChild(() => {
        const { onDestroy } = useDestroy();
        onDestroy(() => log("onDestroy in child"));

        useChild(() => {
          const { onDestroy } = useDestroy();
          onDestroy(() => log("onDestroy in grandchild"));
        });
      });
    });
  });

  ent.destroy();
  expect(messages).toEqual(["onDestroy in grandchild", "onDestroy in child"]);
});

test("destroy disables", () => {
  let ent!: Entity;

  createRoot(() => {
    ent = useChild(() => {
      const { onDestroy } = useDestroy();
      onDestroy(() => log("onDestroy in component"));

      const { onDisabled } = useEnableDisable();
      onDisabled(() => log("component disabled"));

      useChild(() => {
        const { onDestroy } = useDestroy();
        onDestroy(() => log("onDestroy in child"));

        const { onDisabled } = useEnableDisable();
        onDisabled(() => log("child disabled"));

        useChild(() => {
          const { onDestroy } = useDestroy();
          onDestroy(() => log("onDestroy in grandchild"));

          const { onDisabled } = useEnableDisable();
          onDisabled(() => log("grandchild disabled"));
        });
      });
    });
  });

  ent.destroy();
  expect(messages).toEqual([
    "grandchild disabled",
    "onDestroy in grandchild",
    "child disabled",
    "onDestroy in child",
    "component disabled",
    "onDestroy in component",
  ]);
});

test("destroy from component A runs onDestroy in sibling component", () => {
  let ent!: Entity;

  createRoot(() => {
    ent = useChild(() => {
      const { onDestroy, destroy } = useDestroy();
      onDestroy(() => log("onDestroy in component"));

      useNewComponent(() => {
        const { onDestroy } = useDestroy();
        onDestroy(() => log("onDestroy in other component"));
      });

      return {
        boom: useCallbackAsCurrent(destroy),
      };
    });
  });

  // @ts-ignore
  ent.rootComponent.boom();
  expect(messages).toEqual([
    "onDestroy in component",
    "onDestroy in other component",
  ]);
});
