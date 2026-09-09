/// <reference types="@test-it/core/globals" />
import {
  Component,
  Entity,
  ErrorBoundary,
  RunLoop,
  createRoot,
  useFrame,
  useNewComponent,
  useType,
} from "..";

let calls: Array<string> = [];

beforeEach(() => {
  calls = [];
});

function runLoopOf(entity: Entity): ReturnType<typeof RunLoop> & Component {
  const runLoop = entity.getComponent(RunLoop);
  if (!runLoop) throw new Error("no RunLoop on that Entity");
  return runLoop;
}

/** Creates a root with a paused RunLoop, so frames only happen when asked for. */
function startPaused(scene: () => void) {
  const root = createRoot(function Root() {
    useType(Root);
    useNewComponent(RunLoop);
    scene();
  });

  runLoopOf(root).pause();

  return root;
}

test("useFrame creates a RunLoop on the root Entity if there is not one already", () => {
  const root = createRoot(function Root() {
    useType(Root);
    useFrame(() => calls.push("frame"));
  });

  const runLoop = runLoopOf(root);
  runLoop.pause();

  expect(runLoop).not.toBe(null);

  runLoop.step();
  expect(calls).toEqual(["frame"]);
});

test("step runs every frame callback once", () => {
  const root = startPaused(() => {
    useFrame(() => calls.push("a"));
    useFrame(() => calls.push("b"));
  });

  runLoopOf(root).step();
  expect(calls).toEqual(["a", "b"]);

  runLoopOf(root).step();
  expect(calls).toEqual(["a", "b", "a", "b"]);
});

test("step reports a fixed delta of one sixtieth of a second", () => {
  const deltas: Array<number> = [];

  const root = startPaused(() => {
    useFrame((delta) => deltas.push(delta));
  });

  runLoopOf(root).step();

  expect(deltas).toEqual([16.667]);
});

test("frameNumber counts every batch of callbacks that has run", () => {
  const root = startPaused(() => {
    useFrame(() => calls.push("frame"));
  });

  const runLoop = runLoopOf(root);
  const before = runLoop.frameNumber;

  runLoop.step();
  runLoop.step();
  runLoop.step();

  expect(runLoop.frameNumber).toBe(before + 3);
});

test("lower group indices run before higher ones, whatever order they registered in", () => {
  const root = startPaused(() => {
    useFrame(() => calls.push("group 2"), 2);
    useFrame(() => calls.push("group 0"), 0);
    useFrame(() => calls.push("group 1"), 1);
  });

  runLoopOf(root).step();

  expect(calls).toEqual(["group 0", "group 1", "group 2"]);
});

test("group indices with nothing registered in them are skipped", () => {
  const root = startPaused(() => {
    useFrame(() => calls.push("group 5"), 5);
    useFrame(() => calls.push("group 0"), 0);
  });

  runLoopOf(root).step();

  expect(calls).toEqual(["group 0", "group 5"]);
});

test("callbacks in the same group run in the order they were registered", () => {
  const root = startPaused(() => {
    useFrame(() => calls.push("first"));
    useFrame(() => calls.push("second"));
    useFrame(() => calls.push("third"));
  });

  runLoopOf(root).step();

  expect(calls).toEqual(["first", "second", "third"]);
});

test("removeFrameCallback stops a callback from running again", () => {
  const callback = () => calls.push("frame");

  const root = startPaused(() => {});
  const runLoop = runLoopOf(root);

  runLoop.addFrameCallback(callback);
  runLoop.step();
  expect(calls).toEqual(["frame"]);

  runLoop.removeFrameCallback(callback);
  runLoop.step();
  expect(calls).toEqual(["frame"]);
});

test("removeFrameCallback only removes from the group it is given", () => {
  const callback = () => calls.push("frame");

  const root = startPaused(() => {});
  const runLoop = runLoopOf(root);

  runLoop.addFrameCallback(callback, 1);
  runLoop.removeFrameCallback(callback, 0);

  runLoop.step();
  expect(calls).toEqual(["frame"]);
});

test("disabling a Component takes its frame callback out of the loop", () => {
  let component!: Component;

  const root = startPaused(() => {
    component = useNewComponent(function Ticker() {
      useType(Ticker);
      useFrame(() => calls.push("frame"));
    });
  });

  const runLoop = runLoopOf(root);

  runLoop.step();
  expect(calls).toEqual(["frame"]);

  component.disable();
  runLoop.step();
  expect(calls).toEqual(["frame"]);

  component.enable();
  runLoop.step();
  expect(calls).toEqual(["frame", "frame"]);
});

test("pause and resume report themselves through isPaused", () => {
  const root = startPaused(() => {});
  const runLoop = runLoopOf(root);

  expect(runLoop.isPaused()).toBe(true);

  runLoop.resume();
  expect(runLoop.isPaused()).toBe(false);

  runLoop.pause();
  expect(runLoop.isPaused()).toBe(true);
});

test("known quirk: step runs frame callbacks even while paused", () => {
  const root = startPaused(() => {
    useFrame(() => calls.push("frame"));
  });

  const runLoop = runLoopOf(root);
  expect(runLoop.isPaused()).toBe(true);

  // step is meant for stepping through a paused game, but it does not check
  // isPaused, so it also fires an extra frame on a running one.
  runLoop.step();
  expect(calls).toEqual(["frame"]);
});

test("an error in one frame callback does not stop the others", () => {
  const seen: Array<string> = [];

  const root = startPaused(() => {
    useNewComponent(function Boundary() {
      useType(Boundary);
      return ErrorBoundary((error) => seen.push(error.message));
    });

    useFrame(() => calls.push("before"));
    useFrame(() => {
      throw new Error("frame blew up");
    });
    useFrame(() => calls.push("after"));
  });

  runLoopOf(root).step();

  expect(calls).toEqual(["before", "after"]);
  expect(seen).toEqual(["frame blew up"]);
});

test("known quirk: a callback added during a frame runs in that same frame", () => {
  const root = startPaused(() => {});
  const runLoop = runLoopOf(root);

  runLoop.addFrameCallback(function outer() {
    calls.push("outer");
    runLoop.removeFrameCallback(outer);
    runLoop.addFrameCallback(() => calls.push("added during the frame"));
  });

  // Callbacks live in a Set that is iterated with for..of, and a Set visits
  // entries added while it is being iterated.
  runLoop.step();
  expect(calls).toEqual(["outer", "added during the frame"]);
});

test("a callback removed during a frame does not run in that frame", () => {
  const root = startPaused(() => {});
  const runLoop = runLoopOf(root);

  const later = () => calls.push("later");

  runLoop.addFrameCallback(() => {
    calls.push("first");
    runLoop.removeFrameCallback(later);
  });
  runLoop.addFrameCallback(later);

  runLoop.step();

  expect(calls).toEqual(["first"]);
});
