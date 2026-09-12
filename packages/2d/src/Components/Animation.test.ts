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

test("a freshly created Animation has not got through any of its first frame", () => {
  const animation = startWithAnimation(frames(2));

  expect(animation.currentFrameCompletion).toBe(0);

  for (let index = 0; index < STEPS_PER_FRAME * 3; index++) step();
  expect(animation.currentFrameCompletion).toBe(0);
});

test("completion starts moving once the animation is played", () => {
  const animation = startWithAnimation(frames(2));

  animation.play();
  expect(animation.currentFrameCompletion).toBe(0);

  step();
  expect(animation.currentFrameCompletion).toBeGreaterThan(0);
});

test("goToFrame on an unplayed Animation starts that frame from the beginning", () => {
  const animation = startWithAnimation(frames(3));

  animation.goToFrame(1);

  expect(animation.currentFrameCompletion).toBe(0);
});

test("a finished non-looping animation stays at a completion of one", () => {
  const animation = startWithAnimation(frames(2), { loop: false });

  animation.play();
  for (let index = 0; index < STEPS_PER_FRAME * 2; index++) step();
  expect(animation.currentFrameIndex).toBe(1);

  expect(animation.currentFrameCompletion).toBe(1);

  for (let index = 0; index < STEPS_PER_FRAME * 20; index++) step();
  expect(animation.currentFrameCompletion).toBe(1);
});

test("completion never goes above one part way through either", () => {
  const animation = startWithAnimation(frames(3));

  animation.play();
  for (let index = 0; index < STEPS_PER_FRAME * 5; index++) {
    step();
    expect(animation.currentFrameCompletion).toBeLessThanOrEqual(1);
  }
});

test("turning looping back on after finishing carries on from the end", () => {
  const animation = startWithAnimation(frames(2), { loop: false });

  animation.play();
  for (let index = 0; index < STEPS_PER_FRAME * 4; index++) step();
  expect(animation.currentFrameIndex).toBe(1);

  animation.loop = true;
  step();

  expect(animation.currentFrameIndex).toBe(0);
});

test("goToFrame says which frames there were when given one that is not there", () => {
  const animation = startWithAnimation(frames(2));

  expect(() => animation.goToFrame(99)).toThrowError(
    /Animation has 2 frames, so there is no frame 99/
  );
  expect(() => animation.goToFrame(2)).toThrowError(/no frame 2/);
  expect(() => animation.goToFrame(-1)).toThrowError(/no frame -1/);
});

test("goToFrame accepts the first and last frames", () => {
  const animation = startWithAnimation(frames(3));

  animation.goToFrame(0);
  expect(animation.currentFrameIndex).toBe(0);

  animation.goToFrame(2);
  expect(animation.currentFrameIndex).toBe(2);
});

test("a frame that was rejected leaves the animation where it was", () => {
  const animation = startWithAnimation(frames(3));

  animation.goToFrame(1);
  expect(() => animation.goToFrame(99)).toThrowError();

  expect(animation.currentFrameIndex).toBe(1);
});
