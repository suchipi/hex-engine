/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import Keyboard, { useFirstKey } from "./Keyboard";
import { endGame, keyDown, keyUp, startGame } from "./inputTestSetup";

afterEach(endGame);

// `firstKeyHasHappened` is module-level state that can only flip once per page,
// and Test-It gives each test file its own page, so the whole lifecycle has to
// be one test.
test("first-key handlers run once, synchronously, on the first keydown", () => {
  const calls: Array<string> = [];
  let early!: ReturnType<typeof useFirstKey>;
  let late!: ReturnType<typeof useFirstKey>;

  const root = startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      useNewComponent(Keyboard);
      early = useFirstKey(() => calls.push("first"));
      useFirstKey(() => calls.push("second"));
    });
  });

  expect(early.firstKeyHasHappened).toBe(false);
  expect(calls).toEqual([]);

  keyDown("a");
  expect(early.firstKeyHasHappened).toBe(true);
  expect(calls).toEqual(["first", "second"]);

  keyUp("a");
  keyDown("b");
  expect(calls).toEqual(["first", "second"]);

  // Registering once the first key is already behind us runs the handler right
  // away, rather than waiting for a keypress that will never be "first".
  root.createChild(function Late() {
    useType(Late);

    useNewComponent(Keyboard);
    late = useFirstKey(() => calls.push("late"));
  });

  expect(late.firstKeyHasHappened).toBe(true);
  expect(calls).toEqual(["first", "second", "late"]);

  keyDown("c");
  expect(calls).toEqual(["first", "second", "late"]);
});
