import { createRoot, useType, useEnableDisable, useNewComponent } from "..";

let messages: Array<string> = [];
const log = (msg: string) => messages.push(msg);

beforeEach(() => {
  messages = [];
});

test("dynamic add", () => {
  function Root() {
    useType(Root);
  }

  function DynamicallyAdded() {
    useType(DynamicallyAdded);
  }

  const ent = createRoot(Root);
  expect(ent.getComponent(DynamicallyAdded)).toBe(null);
  const added = ent.addComponent(DynamicallyAdded);
  expect(ent.getComponent(DynamicallyAdded)).toBe(added);
});

test("dynamic add with enable disable", () => {
  function Root() {
    useType(Root);
  }

  function DynamicallyAdded() {
    useType(DynamicallyAdded);

    const { onEnabled, onDisabled } = useEnableDisable();
    onEnabled(() => log("enabled"));
    onDisabled(() => log("disabled"));
  }

  const ent = createRoot(Root);
  ent.addComponent(DynamicallyAdded);
  expect(messages).toEqual(["enabled"]);
});

test("dynamic remove", () => {
  function Root() {
    useType(Root);

    useNewComponent(DynamicallyRemoved);
  }

  function DynamicallyRemoved() {
    useType(DynamicallyRemoved);
  }

  const ent = createRoot(Root);
  const toRemove = ent.getComponent(DynamicallyRemoved);
  expect(toRemove).not.toBe(null);
  ent.removeComponent(toRemove!);
  expect(ent.getComponent(DynamicallyRemoved)).toBe(null);
});

test("dynamic add with enable disable", () => {
  function Root() {
    useType(Root);

    useNewComponent(DynamicallyRemoved);
  }

  function DynamicallyRemoved() {
    useType(DynamicallyRemoved);

    const { onEnabled, onDisabled } = useEnableDisable();
    onEnabled(() => log("enabled"));
    onDisabled(() => log("disabled"));
  }

  const ent = createRoot(Root);
  const toRemove = ent.getComponent(DynamicallyRemoved);
  ent.removeComponent(toRemove!);
  expect(messages).toEqual(["enabled", "disabled"]);
});
