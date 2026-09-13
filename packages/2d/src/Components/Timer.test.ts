/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import Timer from "./Timer";
import { endGame, startGame, step } from "./inputTestSetup";

const FRAME_MS = 16.667;

afterEach(endGame);

function startWithTimer(): ReturnType<typeof Timer> {
  let timer!: ReturnType<typeof Timer>;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);
      timer = useNewComponent(Timer);
    });
  });

  return timer;
}

test("a fresh Timer sits at zero", () => {
  const timer = startWithTimer();

  expect(timer.target).toBe(0);
  expect(timer.distanceFromSetTime()).toBe(0);
});

test("a Timer that was never set has already reached its time", () => {
  const timer = startWithTimer();

  expect(timer.hasReachedSetTime()).toBe(true);

  step();
  expect(timer.hasReachedSetTime()).toBe(true);
});

test("setToTimeFromNow counts down by the frame delta", () => {
  const timer = startWithTimer();

  timer.setToTimeFromNow(100);
  expect(timer.target).toBe(100);

  step();
  expect(timer.target).toBeCloseTo(100 - FRAME_MS, 3);

  step();
  expect(timer.target).toBeCloseTo(100 - FRAME_MS * 2, 3);
});

test("hasReachedSetTime flips once the countdown gets to zero", () => {
  const timer = startWithTimer();

  // Two steps land the countdown on exactly zero, which counts as reached.
  timer.setToTimeFromNow(FRAME_MS * 2);

  step();
  expect(timer.hasReachedSetTime()).toBe(false);

  step();
  expect(timer.target).toBe(0);
  expect(timer.hasReachedSetTime()).toBe(true);
});

test("the countdown keeps going negative after the time is reached", () => {
  const timer = startWithTimer();

  timer.setToTimeFromNow(0);

  step();
  step();

  expect(timer.target).toBeCloseTo(-FRAME_MS * 2, 3);
});

test("a time of zero has been reached as soon as it is set", () => {
  const timer = startWithTimer();

  timer.setToTimeFromNow(0);

  expect(timer.hasReachedSetTime()).toBe(true);
});

test("setToTimeFromNow accepts a time in the past", () => {
  const timer = startWithTimer();

  timer.setToTimeFromNow(-50);

  expect(timer.hasReachedSetTime()).toBe(true);
});

test("setting a new time restarts the countdown", () => {
  const timer = startWithTimer();

  timer.setToTimeFromNow(10);
  step();
  expect(timer.hasReachedSetTime()).toBe(true);

  timer.setToTimeFromNow(100);
  expect(timer.hasReachedSetTime()).toBe(false);
  expect(timer.target).toBe(100);
});

test("distanceFromSetTime and target report the same thing", () => {
  const timer = startWithTimer();

  timer.setToTimeFromNow(100);
  step();

  expect(timer.distanceFromSetTime()).toBe(timer.target);
});

test("a disabled Timer stops counting down", () => {
  let timer!: ReturnType<typeof Timer> & { disable(): void; enable(): void };

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);
      timer = useNewComponent(Timer);
    });
  });

  timer.setToTimeFromNow(100);
  timer.disable();

  step();
  expect(timer.target).toBe(100);

  timer.enable();
  step();
  expect(timer.target).toBeCloseTo(100 - FRAME_MS, 3);
});

test("two Timers count down independently", () => {
  let first!: ReturnType<typeof Timer>;
  let second!: ReturnType<typeof Timer>;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);
      first = useNewComponent(Timer);
      second = useNewComponent(Timer);
    });
  });

  first.setToTimeFromNow(100);
  second.setToTimeFromNow(200);

  step();

  expect(first.target).toBeCloseTo(100 - FRAME_MS, 3);
  expect(second.target).toBeCloseTo(200 - FRAME_MS, 3);
});
