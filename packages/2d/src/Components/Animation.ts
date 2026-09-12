import { useNewComponent, useType } from "@hex-engine/core";
import { useUpdate } from "../Hooks";
import Timer from "./Timer";

/**
 * A class that represents a single frame in an animation.
 *
 * The data that is in this frame can be anything.
 */
export class AnimationFrame<T> {
  data: T;
  duration: number; // in ms
  onFrame: (() => void) | null;

  constructor(
    data: T,
    { duration, onFrame }: { duration: number; onFrame?: null | (() => void) }
  ) {
    this.data = data;
    this.duration = duration;
    this.onFrame = onFrame || null;
  }
}

export type AnimationAPI<T> = {
  /** The frames in the animation (as passed in). */
  readonly frames: Array<AnimationFrame<T>>;

  /** Whether to loop the animation. */
  loop: boolean;

  /** The index of the current frame within the frame array. */
  readonly currentFrameIndex: number;

  /** The current animation frame; ie, current in time. */
  readonly currentFrame: AnimationFrame<T>;

  /** A number from 0 to 1 indicating how far we have gotten through the current frame. */
  readonly currentFrameCompletion: number;

  /** Pause playback of this animation. */
  pause(): void;

  /** Resume playback of this animation. */
  resume(): void;

  /** Begin playback of this animation. */
  play(): void;

  /** Restart playback of this animation from the first frame. */
  restart(): void;

  /** Go to a specific frame. */
  goToFrame(frameNumber: number): void;
};

/**
 * A Component that represents an Animation, where each frame has a duration and contains arbitrary data.
 */
export default function Animation<T>(
  frames: Array<AnimationFrame<T>>,
  { loop = true }: { loop?: boolean | undefined } = {}
): AnimationAPI<T> {
  useType(Animation);

  const timer = useNewComponent(Timer);
  timer.disable();
  let currentFrameIndex = 0;
  let frameTimerHasBeenSet = false;

  function getCurrentFrame() {
    return frames[currentFrameIndex];
  }

  function setFrameTimer(duration: number) {
    frameTimerHasBeenSet = true;
    timer.setToTimeFromNow(duration);
  }

  const state = {
    loop,
  };

  useUpdate(() => {
    if (timer.hasReachedSetTime()) {
      if (currentFrameIndex === frames.length - 1) {
        if (state.loop) {
          currentFrameIndex = 0;
        } else {
          // Stay on the last frame, with the clock parked on the moment it
          // finished. Left to run on, it would drag currentFrameCompletion
          // further past 1 with every frame that went by.
          timer.setToTimeFromNow(0);
          return;
        }
      } else {
        currentFrameIndex++;
      }

      const currentFrame = getCurrentFrame();
      setFrameTimer(currentFrame.duration);

      if (currentFrame.onFrame) {
        currentFrame.onFrame();
      }
    }
  });

  function goToFrame(frameNumber: number) {
    if (frameNumber < 0 || frameNumber >= frames.length) {
      throw new Error(
        `Animation has ${frames.length} frames, so there is no frame ${frameNumber} to go to`
      );
    }

    currentFrameIndex = frameNumber;
    const currentFrame = getCurrentFrame();
    setFrameTimer(currentFrame.duration);

    if (currentFrame.onFrame) {
      currentFrame.onFrame();
    }
  }

  return {
    frames,

    get loop() {
      return state.loop;
    },

    set loop(nextValue: boolean) {
      state.loop = nextValue;
    },

    get currentFrameIndex() {
      return currentFrameIndex;
    },

    get currentFrame() {
      return getCurrentFrame();
    },

    get currentFrameCompletion() {
      if (!frameTimerHasBeenSet) {
        return 0;
      }

      const currentFrame = getCurrentFrame();
      if (currentFrame.duration === 0) {
        return 1;
      }

      // A frame can overshoot its duration by however long the last frame took,
      // and a finished animation sits past the end of its last one, so this is
      // capped rather than reporting more than a whole frame's worth.
      return Math.min(
        1,
        1 - timer.distanceFromSetTime() / currentFrame.duration
      );
    },

    pause() {
      timer.disable();
    },

    resume() {
      timer.enable();
    },

    play() {
      timer.enable();
      const currentFrame = getCurrentFrame();
      setFrameTimer(currentFrame.duration);

      if (currentFrame.onFrame) {
        currentFrame.onFrame();
      }
    },

    restart() {
      timer.enable();
      goToFrame(0);
    },

    goToFrame,
  };
}
