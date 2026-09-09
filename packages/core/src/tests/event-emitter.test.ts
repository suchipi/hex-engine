/// <reference types="@test-it/core/globals" />
import { EventEmitter } from "..";

type TestEvent = {
  eventType: "opened" | "closed";
  eventPhase: "BEFORE" | "AFTER";
  payload?: string;
};

function makeEmitter() {
  return new EventEmitter<TestEvent>();
}

test("a registered listener receives the events it asked for", () => {
  const emitter = makeEmitter();
  const seen: Array<TestEvent> = [];

  emitter.register("opened", "BEFORE", (event) => seen.push(event));

  const event: TestEvent = {
    eventType: "opened",
    eventPhase: "BEFORE",
    payload: "hi",
  };
  emitter.emit(event);

  expect(seen).toEqual([event]);
});

test("listeners only hear their own event type", () => {
  const emitter = makeEmitter();
  const seen: Array<string> = [];

  emitter.register("opened", "BEFORE", () => seen.push("opened"));
  emitter.register("closed", "BEFORE", () => seen.push("closed"));

  emitter.emit({ eventType: "closed", eventPhase: "BEFORE" });

  expect(seen).toEqual(["closed"]);
});

test("listeners only hear their own event phase", () => {
  const emitter = makeEmitter();
  const seen: Array<string> = [];

  emitter.register("opened", "BEFORE", () => seen.push("before"));
  emitter.register("opened", "AFTER", () => seen.push("after"));

  emitter.emit({ eventType: "opened", eventPhase: "AFTER" });

  expect(seen).toEqual(["after"]);
});

test("listeners run in the order they were registered", () => {
  const emitter = makeEmitter();
  const seen: Array<string> = [];

  emitter.register("opened", "BEFORE", () => seen.push("first"));
  emitter.register("opened", "BEFORE", () => seen.push("second"));
  emitter.register("opened", "BEFORE", () => seen.push("third"));

  emitter.emit({ eventType: "opened", eventPhase: "BEFORE" });

  expect(seen).toEqual(["first", "second", "third"]);
});

test("emitting an event nobody listens for does nothing", () => {
  const emitter = makeEmitter();

  expect(() => {
    emitter.emit({ eventType: "opened", eventPhase: "BEFORE" });
  }).not.toThrowError();
});

test("emitting a phase nobody listens for does nothing", () => {
  const emitter = makeEmitter();
  const seen: Array<string> = [];

  emitter.register("opened", "BEFORE", () => seen.push("before"));
  emitter.emit({ eventType: "opened", eventPhase: "AFTER" });

  expect(seen).toEqual([]);
});

test("disposing a registration stops that listener", () => {
  const emitter = makeEmitter();
  const seen: Array<string> = [];

  const registration = emitter.register("opened", "BEFORE", () =>
    seen.push("heard")
  );

  emitter.emit({ eventType: "opened", eventPhase: "BEFORE" });
  expect(seen).toEqual(["heard"]);

  registration.dispose();
  emitter.emit({ eventType: "opened", eventPhase: "BEFORE" });
  expect(seen).toEqual(["heard"]);
});

test("disposing twice is harmless", () => {
  const emitter = makeEmitter();
  const registration = emitter.register("opened", "BEFORE", () => {});

  registration.dispose();

  expect(() => registration.dispose()).not.toThrowError();
});

test("disposing one listener leaves the others alone", () => {
  const emitter = makeEmitter();
  const seen: Array<string> = [];

  const first = emitter.register("opened", "BEFORE", () => seen.push("first"));
  emitter.register("opened", "BEFORE", () => seen.push("second"));

  first.dispose();
  emitter.emit({ eventType: "opened", eventPhase: "BEFORE" });

  expect(seen).toEqual(["second"]);
});

test("a registration can also be disposed through Symbol.dispose", () => {
  const emitter = makeEmitter();
  const seen: Array<string> = [];

  const registration = emitter.register("opened", "BEFORE", () =>
    seen.push("heard")
  );

  registration[Symbol.dispose]();
  emitter.emit({ eventType: "opened", eventPhase: "BEFORE" });

  expect(seen).toEqual([]);
});

test("known quirk: registering the same function twice only registers it once", () => {
  const emitter = makeEmitter();
  const seen: Array<string> = [];
  const listener = () => seen.push("heard");

  const first = emitter.register("opened", "BEFORE", listener);
  emitter.register("opened", "BEFORE", listener);

  emitter.emit({ eventType: "opened", eventPhase: "BEFORE" });
  expect(seen).toEqual(["heard"]);

  // Listeners live in a Set, so the second registration was a no-op, and
  // disposing either handle removes the shared entry.
  first.dispose();
  emitter.emit({ eventType: "opened", eventPhase: "BEFORE" });
  expect(seen).toEqual(["heard"]);
});
