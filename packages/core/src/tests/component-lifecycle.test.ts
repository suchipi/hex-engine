/// <reference types="@test-it/core/globals" />
import {
  Component,
  Entity,
  createRoot,
  useChild,
  useEnableDisable,
  useNewComponent,
  useType,
} from "..";

let calls: Array<string> = [];

beforeEach(() => {
  calls = [];
});

function Subject(name: string = "subject") {
  useType(Subject);

  const enableDisable = useEnableDisable();
  enableDisable.onEnabled(() => calls.push(`${name} enabled`));
  enableDisable.onDisabled(() => calls.push(`${name} disabled`));

  return {
    readIsEnabled: () => enableDisable.isEnabled,
    setIsEnabled: (value: boolean) => {
      enableDisable.isEnabled = value;
    },
  };
}

function startWithSubject(): ReturnType<typeof Subject> & Component {
  let subject!: ReturnType<typeof Subject> & Component;

  createRoot(function Root() {
    useType(Root);
    subject = useNewComponent(() => Subject());
  });

  return subject;
}

test("components start enabled, and onEnabled runs immediately for them", () => {
  const subject = startWithSubject();

  expect(subject.isEnabled).toBe(true);
  expect(calls).toEqual(["subject enabled"]);
});

test("onDisabled runs immediately when the component is already disabled", () => {
  let subject!: Component;

  createRoot(function Root() {
    useType(Root);

    subject = useNewComponent(function Late() {
      useType(Late);

      const { onDisabled, isEnabled } = useEnableDisable();
      expect(isEnabled).toBe(true);
      onDisabled(() => calls.push("disabled"));
    });
  });

  expect(calls).toEqual([]);

  subject.disable();
  expect(calls).toEqual(["disabled"]);

  // Registering now, while already disabled, runs the handler right away.
  subject.entity.addComponent(function Later() {
    useType(Later);
  });
  expect(calls).toEqual(["disabled"]);
});

test("disable and enable toggle isEnabled and run their callbacks", () => {
  const subject = startWithSubject();

  subject.disable();
  expect(subject.isEnabled).toBe(false);
  expect(calls).toEqual(["subject enabled", "subject disabled"]);

  subject.enable();
  expect(subject.isEnabled).toBe(true);
  expect(calls).toEqual([
    "subject enabled",
    "subject disabled",
    "subject enabled",
  ]);
});

test("disabling an already-disabled component does nothing", () => {
  const subject = startWithSubject();

  subject.disable();
  subject.disable();
  subject.disable();

  expect(calls).toEqual(["subject enabled", "subject disabled"]);
});

test("enabling an already-enabled component does nothing", () => {
  const subject = startWithSubject();

  subject.enable();
  subject.enable();

  expect(calls).toEqual(["subject enabled"]);
});

test("the isEnabled setter routes to enable and disable", () => {
  const subject = startWithSubject();

  subject.setIsEnabled(false);
  expect(subject.isEnabled).toBe(false);

  subject.setIsEnabled(true);
  expect(subject.isEnabled).toBe(true);

  expect(calls).toEqual([
    "subject enabled",
    "subject disabled",
    "subject enabled",
  ]);
});

test("isEnabled is already up to date inside the callbacks", () => {
  let seenDuringEnable: null | boolean = null;
  let seenDuringDisable: null | boolean = null;
  let subject!: Component;

  createRoot(function Root() {
    useType(Root);

    subject = useNewComponent(function Watcher() {
      useType(Watcher);

      const enableDisable = useEnableDisable();
      enableDisable.onEnabled(() => {
        seenDuringEnable = enableDisable.isEnabled;
      });
      enableDisable.onDisabled(() => {
        seenDuringDisable = enableDisable.isEnabled;
      });
    });
  });

  subject.disable();
  expect(seenDuringDisable).toBe(false);

  subject.enable();
  expect(seenDuringEnable).toBe(true);
});

test("enabling from inside an onEnabled callback does not recurse", () => {
  let subject!: Component;

  createRoot(function Root() {
    useType(Root);

    subject = useNewComponent(function Recursive() {
      useType(Recursive);

      const { onEnabled } = useEnableDisable();
      onEnabled(() => {
        calls.push("enabled");
        subject.enable();
      });
    });
  });

  subject.disable();
  calls = [];

  subject.enable();
  expect(calls).toEqual(["enabled"]);
});

test("disabling an Entity disables every Component on it and on its descendants", () => {
  let entity!: Entity;

  createRoot(function Root() {
    useType(Root);

    entity = useChild(function Parent() {
      useType(Parent);

      useNewComponent(() => Subject("parent-a"));
      useNewComponent(() => Subject("parent-b"));

      useChild(function Kid() {
        useType(Kid);
        useNewComponent(() => Subject("kid"));
      });
    });
  });

  calls = [];

  entity.disable();
  expect(calls).toEqual([
    "parent-a disabled",
    "parent-b disabled",
    "kid disabled",
  ]);

  calls = [];
  entity.enable();
  expect(calls).toEqual([
    "parent-a enabled",
    "parent-b enabled",
    "kid enabled",
  ]);
});

test("each Component keeps its own enable state", () => {
  let first!: Component;
  let second!: Component;

  createRoot(function Root() {
    useType(Root);

    first = useNewComponent(() => Subject("first"));
    second = useNewComponent(() => Subject("second"));
  });

  first.disable();

  expect(first.isEnabled).toBe(false);
  expect(second.isEnabled).toBe(true);
});
