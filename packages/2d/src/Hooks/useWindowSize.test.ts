/// <reference types="@test-it/core/globals" />
import {
  Component,
  useChild,
  useNewComponent,
  useType,
} from "@hex-engine/core";
import { endGame, startGame, step, xy } from "../Components/inputTestSetup";
import useWindowSize from "./useWindowSize";

let calls: Array<string> = [];

beforeEach(() => {
  calls = [];
});

afterEach(endGame);

/**
 * Runs `body` with window.innerWidth reporting `width`, then puts the real
 * property back. The listener reads window.innerWidth directly, so this is the
 * only way to move it without resizing the actual window.
 */
function withWindowWidth(width: number, body: () => void) {
  const real = Object.getOwnPropertyDescriptor(window, "innerWidth")!;

  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    get: () => width,
  });

  try {
    body();
  } finally {
    Object.defineProperty(window, "innerWidth", real);
  }
}

function startWatchingWindowSize() {
  let api!: ReturnType<typeof useWindowSize>;
  let component!: Component;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      component = useNewComponent(function Watcher() {
        useType(Watcher);
        api = useWindowSize();
        api.onWindowResize(() => calls.push("resized"));
      });
    });
  });

  return { api, component };
}

test("windowSize starts out matching the window", () => {
  const { api } = startWatchingWindowSize();

  expect(xy(api.windowSize)).toEqual({
    x: window.innerWidth,
    y: window.innerHeight,
  });
});

test("two Components watching the window share one size Vector", () => {
  let first!: ReturnType<typeof useWindowSize>;
  let second!: ReturnType<typeof useWindowSize>;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      useNewComponent(function A() {
        useType(A);
        first = useWindowSize();
      });
      useNewComponent(function B() {
        useType(B);
        second = useWindowSize();
      });
    });
  });

  expect(second.windowSize).toBe(first.windowSize);
});

test("handlers do not run for a resize event that did not change the size", () => {
  startWatchingWindowSize();

  window.dispatchEvent(new Event("resize"));
  step();

  expect(calls).toEqual([]);
});

test("handlers run on the frame after the window actually changes size", () => {
  const { api } = startWatchingWindowSize();

  withWindowWidth(1234, () => {
    window.dispatchEvent(new Event("resize"));

    // Nothing until a frame runs; the notification is deferred.
    expect(calls).toEqual([]);

    step();
    expect(calls).toEqual(["resized"]);
    expect(api.windowSize.x).toBe(1234);

    // And not again on the frame after that.
    step();
    expect(calls).toEqual(["resized"]);
  });
});

test("a disabled Component does not hear about resizes", () => {
  const { component } = startWatchingWindowSize();

  withWindowWidth(4321, () => {
    component.disable();
    window.dispatchEvent(new Event("resize"));
    step();

    expect(calls).toEqual([]);
  });
});
