import { useNewComponent, useType } from "@hex-engine/core";
import { useUpdate } from "../Canvas";
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

  function getCurrentFrame() {
    return frames[currentFrameIndex];
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
          // Do nothing (stay on the last frame)
          return;
        }
      } else {
        currentFrameIndex++;
      }

      const currentFrame = getCurrentFrame();
      timer.setToTimeFromNow(currentFrame.duration);

      if (currentFrame.onFrame) {
        currentFrame.onFrame();
      }
    }
  });

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
      const currentFrame = getCurrentFrame();
      if (currentFrame.duration === 0) {
        return 1;
      }

      return 1 - timer.distanceFromSetTime() / getCurrentFrame().duration;
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
      timer.setToTimeFromNow(currentFrame.duration);

      if (currentFrame.onFrame) {
        currentFrame.onFrame();
      }
    },

    restart() {
      timer.enable();
      currentFrameIndex = 0;
      const currentFrame = getCurrentFrame();
      timer.setToTimeFromNow(currentFrame.duration);

      if (currentFrame.onFrame) {
        currentFrame.onFrame();
      }
    },
  };
}
