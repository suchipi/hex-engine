/// <reference types="@test-it/core/globals" />
import Preloader from "./Preloader";

// Preloader is a module singleton whose promise chain is never reset, so each
// test puts it back to a resolved promise afterward.
afterEach(() => {
  Preloader._currentPromise = Promise.resolve();
});

test("load resolves immediately when no tasks have been added", async () => {
  let resolved = false;

  await Preloader.load().then(() => {
    resolved = true;
  });

  expect(resolved).toBe(true);
});

test("a task starts running as soon as it is added", () => {
  let started = false;

  Preloader.addTask(() => {
    started = true;
    return Promise.resolve();
  });

  expect(started).toBe(true);
});

test("load waits for every task that was added", async () => {
  const finished: Array<string> = [];

  let releaseFirst!: () => void;
  let releaseSecond!: () => void;

  Preloader.addTask(
    () =>
      new Promise<void>((resolve) => {
        releaseFirst = () => {
          finished.push("first");
          resolve();
        };
      })
  );
  Preloader.addTask(
    () =>
      new Promise<void>((resolve) => {
        releaseSecond = () => {
          finished.push("second");
          resolve();
        };
      })
  );

  releaseSecond();
  releaseFirst();

  await Preloader.load();

  expect(finished.sort()).toEqual(["first", "second"]);
});

test("addTask returns a promise covering everything added so far", async () => {
  let released!: () => void;

  const promise = Preloader.addTask(
    () =>
      new Promise<void>((resolve) => {
        released = resolve;
      })
  );

  let settled = false;
  promise.then(() => {
    settled = true;
  });

  expect(settled).toBe(false);

  released();
  await promise;

  expect(settled).toBe(true);
});

test("load resolves with nothing, whatever the tasks returned", async () => {
  Preloader.addTask(() => Promise.resolve("a value"));

  expect(await Preloader.load()).toBe(undefined);
});

test("a failed task is reported once, and does not poison later loads", async () => {
  Preloader.addTask(() => Promise.reject(new Error("asset missing")));

  let firstError: Error | null = null;
  await Preloader.load().catch((error) => {
    firstError = error;
  });
  expect((firstError as unknown as Error).message).toBe("asset missing");

  // Whoever was waiting has already heard about it, so the next batch of work
  // gets to succeed on its own terms.
  Preloader.addTask(() => Promise.resolve());

  let secondError: Error | null = null;
  await Preloader.load().catch((error) => {
    secondError = error;
  });

  expect(secondError).toBe(null);
});

test("a task added after a failure still reports its own failure", async () => {
  Preloader.addTask(() => Promise.reject(new Error("first failure")));
  await Preloader.load().catch(() => {});

  Preloader.addTask(() => Promise.reject(new Error("second failure")));

  let error: Error | null = null;
  await Preloader.load().catch((caught) => {
    error = caught;
  });

  expect((error as unknown as Error).message).toBe("second failure");
});
