/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import LowLevelMouse, { useFirstClick } from "./LowLevelMouse";
import { endGame, mouseDown, mouseUp, startGame, step } from "./inputTestSetup";

afterEach(endGame);

// `firstClickHasHappened` is module-level state that can only flip once per
// page, and Test-It gives each test file its own page, so the whole lifecycle
// has to be one test.
test("first-click handlers run once, synchronously, on the first mousedown", () => {
  const calls: Array<string> = [];
  let early!: ReturnType<typeof useFirstClick>;
  let late!: ReturnType<typeof useFirstClick>;

  const root = startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      useNewComponent(LowLevelMouse);
      early = useFirstClick(() => calls.push("first"));
      useFirstClick(() => calls.push("second"));
    });
  });

  expect(early.firstClickHasHappened).toBe(false);
  expect(calls).toEqual([]);

  mouseDown(10, 10);
  expect(early.firstClickHasHappened).toBe(true);
  expect(calls).toEqual(["first", "second"]);

  step();
  mouseUp(10, 10);
  step();
  expect(calls).toEqual(["first", "second"]);

  mouseDown(20, 20);
  step();
  expect(calls).toEqual(["first", "second"]);

  // Registering once the first click is already behind us runs the handler
  // right away, rather than waiting for a click that will never be "first".
  root.createChild(function Late() {
    useType(Late);

    useNewComponent(LowLevelMouse);
    late = useFirstClick(() => calls.push("late"));
  });

  expect(late.firstClickHasHappened).toBe(true);
  expect(calls).toEqual(["first", "second", "late"]);

  mouseDown(30, 30);
  step();
  expect(calls).toEqual(["first", "second", "late"]);
});
