/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import LowLevelMouse, { useFirstClick } from "./LowLevelMouse";
import {
  endGame,
  startGame,
  step,
  touchEnd,
  touchStart,
} from "./inputTestSetup";

afterEach(endGame);

// This lives in its own file for the same reason as useFirstClick.test.ts: the
// first click can only happen once per page.
test("first-click handlers run on the first touchstart too", () => {
  const calls: Array<string> = [];
  let api!: ReturnType<typeof useFirstClick>;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      useNewComponent(LowLevelMouse);
      api = useFirstClick(() => calls.push("first"));
    });
  });

  expect(api.firstClickHasHappened).toBe(false);

  touchStart(10, 10);
  expect(api.firstClickHasHappened).toBe(true);
  expect(calls).toEqual(["first"]);

  step();
  touchEnd(10, 10);
  step();
  touchStart(20, 20);
  step();
  expect(calls).toEqual(["first"]);
});
