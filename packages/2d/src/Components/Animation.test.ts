/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import Animation, { AnimationFrame, AnimationAPI } from "./Animation";
import { endGame, startGame, step } from "./inputTestSetup";

// A frame duration of 40ms takes exactly three 16.667ms steps to run out, with
// room to spare either side of the boundary.
const FRAME_DURATION = 40;
const STEPS_PER_FRAME = 3;

let calls: Array<string> = [];

beforeEach(() => {
  calls = [];
});

afterEach(endGame);

function frames(count: number, duration: number = FRAME_DURATION) {
  return Array.from(
    { length: count },
    (_unused, index) =>
      new AnimationFrame(index, {
        duration,
        onFrame: () => calls.push(`frame ${index}`),
      })
  );
}

function startWithAnimation(
  animationFrames: Array<AnimationFrame<number>>,
  options: { loop?: boolean } = {}
): AnimationAPI<number> {
  let animation!: AnimationAPI<number>;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);
      animation = useNewComponent(() => Animation(animationFrames, options));
    });
  });

  return animation;
}

test("an Animation starts on its first frame, paused", () => {
  const animation = startWithAnimation(frames(3));

  expect(animation.currentFrameIndex).toBe(0);
  expect(animation.currentFrame.data).toBe(0);

  step();
  step();
  step();
  step();

  expect(animation.currentFrameIndex).toBe(0);
  expect(calls).toEqual([]);
});

test("frames is the array it was given", () => {
  const given = frames(2);

  expect(startWithAnimation(given).frames).toBe(given);
});

test("play starts the animation on its current frame", () => {
  const animation = startWithAnimation(frames(3));

  animation.play();
  expect(calls).toEqual(["frame 0"]);
  expect(animation.currentFrameIndex).toBe(0);
});

test("a playing animation moves on once a frame's duration has run out", () => {
  const animation = startWithAnimation(frames(3));

  animation.play();

  for (let index = 0; index < STEPS_PER_FRAME - 1; index++) step();
  expect(animation.currentFrameIndex).toBe(0);

  step();
  expect(animation.currentFrameIndex).toBe(1);
  expect(calls).toEqual(["frame 0", "frame 1"]);
});

test("a looping animation returns to the first frame after the last", () => {
  const animation = startWithAnimation(frames(2));

  animation.play();
  for (let index = 0; index < STEPS_PER_FRAME * 2; index++) step();

  expect(animation.currentFrameIndex).toBe(0);
  expect(calls).toEqual(["frame 0", "frame 1", "frame 0"]);
});

test("a non-looping animation stays on its last frame", () => {
  const animation = startWithAnimation(frames(2), { loop: false });

  animation.play();
  for (let index = 0; index < STEPS_PER_FRAME * 5; index++) step();

  expect(animation.currentFrameIndex).toBe(1);
  expect(calls).toEqual(["frame 0", "frame 1"]);
});

test("loop can be turned on and off while playing", () => {
  const animation = startWithAnimation(frames(2), { loop: false });

  expect(animation.loop).toBe(false);
  animation.loop = true;
  expect(animation.loop).toBe(true);

  animation.play();
  for (let index = 0; index < STEPS_PER_FRAME * 2; index++) step();

  expect(animation.currentFrameIndex).toBe(0);
});

test("pause stops the animation advancing", () => {
  const animation = startWithAnimation(frames(3));

  animation.play();
  animation.pause();

  for (let index = 0; index < STEPS_PER_FRAME * 3; index++) step();

  expect(animation.currentFrameIndex).toBe(0);
});

test("resume picks the animation back up", () => {
  const animation = startWithAnimation(frames(3));

  animation.play();
  animation.pause();
  for (let index = 0; index < STEPS_PER_FRAME * 3; index++) step();
  expect(animation.currentFrameIndex).toBe(0);

  animation.resume();
  for (let index = 0; index < STEPS_PER_FRAME; index++) step();
  expect(animation.currentFrameIndex).toBe(1);
});

test("goToFrame jumps straight to a frame and fires its callback", () => {
  const animation = startWithAnimation(frames(4));

  animation.goToFrame(2);

  expect(animation.currentFrameIndex).toBe(2);
  expect(animation.currentFrame.data).toBe(2);
  expect(calls).toEqual(["frame 2"]);
});

test("restart goes back to the first frame and starts playing", () => {
  const animation = startWithAnimation(frames(3));

  animation.goToFrame(2);
  calls = [];

  animation.restart();
  expect(animation.currentFrameIndex).toBe(0);
  expect(calls).toEqual(["frame 0"]);

  for (let index = 0; index < STEPS_PER_FRAME; index++) step();
  expect(animation.currentFrameIndex).toBe(1);
});

test("currentFrameCompletion runs from zero to one across a frame", () => {
  const animation = startWithAnimation(frames(2));

  animation.play();
  expect(animation.currentFrameCompletion).toBe(0);

  step();
  const partway = animation.currentFrameCompletion;
  expect(partway).toBeGreaterThan(0);
  expect(partway).toBeLessThan(1);

  step();
  expect(animation.currentFrameCompletion).toBeGreaterThan(partway);
});

test("a zero-duration frame reports itself as fully complete", () => {
  const animation = startWithAnimation(frames(2, 0));

  animation.play();

  expect(animation.currentFrameCompletion).toBe(1);
});

test("known quirk: a freshly created Animation reports its first frame as complete", () => {
  const animation = startWithAnimation(frames(2));

  // The Timer starts at 0 and play() has not set a duration yet, so the
  // completion works out to 1 before the animation has shown anything.
  expect(animation.currentFrameCompletion).toBe(1);
});

test("known quirk: a finished non-looping animation reports a completion above one, forever climbing", () => {
  const animation = startWithAnimation(frames(2), { loop: false });

  animation.play();
  for (let index = 0; index < STEPS_PER_FRAME * 2; index++) step();
  expect(animation.currentFrameIndex).toBe(1);

  // Parking on the last frame returns without resetting the Timer, so it keeps
  // counting down past zero and completion keeps climbing past 1.
  const justFinished = animation.currentFrameCompletion;
  expect(justFinished).toBeGreaterThan(1);

  for (let index = 0; index < STEPS_PER_FRAME * 5; index++) step();
  expect(animation.currentFrameCompletion).toBeGreaterThan(justFinished);
});

test("known quirk: turning looping back on after finishing restarts immediately", () => {
  const animation = startWithAnimation(frames(2), { loop: false });

  animation.play();
  for (let index = 0; index < STEPS_PER_FRAME * 4; index++) step();
  expect(animation.currentFrameIndex).toBe(1);

  // The Timer has been expired the whole time it was parked, so the very next
  // frame after re-enabling looping wraps round, however long ago it finished.
  animation.loop = true;
  step();

  expect(animation.currentFrameIndex).toBe(0);
});

test("known quirk: goToFrame does not check that the frame exists", () => {
  const animation = startWithAnimation(frames(2));

  expect(() => animation.goToFrame(99)).toThrowError();
});
