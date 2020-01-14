import * as core from "./index";

describe("@hex-engine/core", () => {
  test("createRoot returns entity", () => {
    const ent = core.createRoot(() => {
      return { something: "yeah" };
    });
    expect(ent.children).toBeInstanceOf(Set);
    expect(ent.components).toBeInstanceOf(Set);
    expect(ent.addChild).toBeInstanceOf(Function);
    expect(ent.disable).toBeInstanceOf(Function);
    expect(ent.enable).toBeInstanceOf(Function);
    expect(ent.getComponent).toBeInstanceOf(Function);
    expect(ent.hasChild).toBeInstanceOf(Function);
    expect(typeof ent.id).toBe("number");
    expect(ent.name).toBe(null); // defaults to null
    expect(ent.parent).toBe(null); // root component has no parent
    expect(ent.removeChild).toBeInstanceOf(Function);
  });

  test("root component api is written to rootEntity.api", () => {
    const ent = core.createRoot(() => {
      return { something: "yeah" };
    });
    expect(ent.api.something).toBe("yeah");
  });

  test("entity children (imperative API)", () => {
    const ent1 = core.createRoot(() => {});
    const ent2 = core.createRoot(() => {});

    expect(ent1.hasChild(ent2)).toBe(false);
    expect(ent1.children.size).toBe(0);
    ent1.addChild(ent2);
    expect(ent1.hasChild(ent2)).toBe(true);
    expect(ent1.children.size).toBe(1);
    expect(ent1.children).toContain(ent2);
    ent1.removeChild(ent2);
    expect(ent1.hasChild(ent2)).toBe(false);
    expect(ent1.children.size).toBe(0);
  });

  test("entity children (declarative API)", () => {
    let innerEnt: any;
    let childEnt: any;
    let innerChildEnt: any;
    const rootEnt = core.createRoot(() => {
      innerEnt = core.useEntity();
      childEnt = core.useChild(() => {
        innerChildEnt = core.useEntity();
        // parent is set at the time this is executed
        expect(innerChildEnt.parent).toBe(innerEnt);
      });
    });

    expect(rootEnt).toBe(innerEnt);
    expect(rootEnt.hasChild(childEnt)).toBe(true);
    expect(childEnt).toBe(innerChildEnt);
  });

  test("useNewComponent", () => {
    const ent1 = core.createRoot(() => {});
    expect(ent1.components.size).toBe(1);

    const ent2 = core.createRoot(() => {
      core.useNewComponent(() => {
        return { innerApi: true };
      });

      return { outerApi: true };
    });

    expect(ent2.components.size).toBe(2);
    expect([...ent2.components][0]).toHaveProperty("innerApi");
    expect([...ent2.components][1]).toHaveProperty("outerApi");
  });

  test("getComponent", () => {
    function Component() {
      core.useType(Component);

      return { hi: "yeah" };
    }

    const ent = core.createRoot(() => {
      core.useNewComponent(Component);
    });

    const comp = ent.getComponent(Component);
    expect(comp).not.toBe(null);
    if (comp != null) {
      expect(comp.hi).toBe("yeah");
    }
  });

  test("useCallbackAsCurrent", () => {
    function Component() {
      core.useType(Component);

      return {
        doSomething: () => {
          return core.useEntity();
        },
      };
    }

    function Component2() {
      core.useType(Component2);

      return {
        doSomethingElse: core.useCallbackAsCurrent(() => {
          return core.useEntity();
        }),
      };
    }

    const ent = core.createRoot(() => {
      core.useNewComponent(Component);
      core.useNewComponent(Component2);
    });

    const comp1 = ent.getComponent(Component);
    expect(comp1).not.toBe(null);
    if (comp1 == null) throw new Error("comp1 not found");

    const comp2 = ent.getComponent(Component2);
    expect(comp2).not.toBe(null);
    if (comp2 == null) throw new Error("comp2 not found");

    expect(() => {
      comp1.doSomething();
    }).toThrowErrorMatchingInlineSnapshot(
      `"Attempted to use a hook function, but there was no active instance."`
    );

    expect(() => {
      comp2.doSomethingElse();
    }).not.toThrowError();

    const result2 = comp2.doSomethingElse();
    expect(result2).toBe(ent);
  });

  test("useStateAccumulator", () => {
    const sym = Symbol();

    const ent = core.createRoot(() => {
      return core.useStateAccumulator<number>(sym);
    });

    const state = ent.api;
    expect(state.all()).toEqual([]);
    state.add(4);
    expect(state.all()).toEqual([4]);
    state.add(5);
    expect(state.all()).toEqual([4, 5]);
  });

  test("useType", () => {
    function Component() {}
    function Component2() {
      core.useType(Component2);
    }

    const ent1 = core.createRoot(Component);
    const ent2 = core.createRoot(Component2);

    expect(ent1.api.type).toBe(null);
    expect(ent2.api.type).toBe(Component2);

    expect(ent1.getComponent(Component)).toBe(null);
    expect(ent2.getComponent(Component2)).not.toBe(null);
  });

  test("useIsEnabled", () => {
    const ent = core.createRoot(() => {
      return {
        checkIfEnabled: core.useCallbackAsCurrent(() => core.useIsEnabled()),
      };
    });

    expect(ent.api.checkIfEnabled()).toBe(true);
    ent.disable();
    expect(ent.api.checkIfEnabled()).toBe(false);
    ent.enable();
    expect(ent.api.checkIfEnabled()).toBe(true);
    ent.api.disable();
    expect(ent.api.checkIfEnabled()).toBe(false);
    ent.api.enable();
    expect(ent.api.checkIfEnabled()).toBe(true);
  });

  test("useEnableDisable - runs onEnabled on initial creation", () => {
    const messages: Array<string> = [];
    const log = (message: string) => messages.push(message);

    core.createRoot(() => {
      const { onEnabled, onDisabled } = core.useEnableDisable();
      onEnabled(() => log("enabled"));
      onDisabled(() => log("disabled"));
    });

    expect(messages).toEqual(["enabled"]);
  });

  test("useEnableDisable - runs onEnabled and onDisabled when the component is enabled or disabled", () => {
    const messages: Array<string> = [];
    const log = (message: string) => messages.push(message);

    const ent = core.createRoot(() => {
      const { onEnabled, onDisabled } = core.useEnableDisable();
      onEnabled(() => log("enabled"));
      onDisabled(() => log("disabled"));
    });

    expect(messages).toEqual(["enabled"]);

    ent.api.disable();

    expect(messages).toEqual(["enabled", "disabled"]);

    ent.api.enable();

    expect(messages).toEqual(["enabled", "disabled", "enabled"]);
  });

  test("useEnableDisable - runs onEnabled and onDisabled when the entity is enabled or disabled", () => {
    const messages: Array<string> = [];
    const log = (message: string) => messages.push(message);

    const ent = core.createRoot(() => {
      const { onEnabled, onDisabled } = core.useEnableDisable();
      onEnabled(() => log("enabled"));
      onDisabled(() => log("disabled"));
    });

    expect(messages).toEqual(["enabled"]);

    ent.disable();

    expect(messages).toEqual(["enabled", "disabled"]);

    ent.enable();

    expect(messages).toEqual(["enabled", "disabled", "enabled"]);
  });

  test.todo("useFrame");

  test("useEntityName", () => {
    const ent1 = core.createRoot(() => {});
    expect(ent1.name).toBe(null);

    const ent2 = core.createRoot(() => {
      core.useEntityName("bob");
    });
    expect(ent2.name).toBe("bob");
  });

  test("useRootEntity", () => {
    expect.assertions(4);

    core.createRoot(() => {
      const root = core.useEntity();
      expect(core.useRootEntity()).toBe(root);

      core.useChild(() => {
        expect(core.useRootEntity()).toBe(root);

        core.useChild(() => {
          expect(core.useRootEntity()).toBe(root);

          core.useChild(() => {
            expect(core.useRootEntity()).toBe(root);
          });
        });
      });
    });
  });

  test.todo("RunLoop");

  test.todo("ErrorBoundary");
});
