import { useNewComponent } from "@hex-engine/core";
import { useUpdate } from "../Canvas";
import Timer from "./Timer";

export class AnimationFrame<T> {
  data: T;
  duration: number; // in ms

  constructor(data: T, { duration }: { duration: number }) {
    this.data = data;
    this.duration = duration;
  }
}

type Props<T> = Array<AnimationFrame<T>>;

export type AnimationAPI<T> = {
  currentFrame: AnimationFrame<T>;
  pause(): void;
  play(): void;
  restart(): void;

  // updateApi
  getIsEnabled: () => boolean;
  enable: () => void;
  disable: () => void;
};

export default function Animation<T>(props: Props<T>): AnimationAPI<T> {
  const frames = props;
  const timer = useNewComponent(Timer);
  timer.disable();
  let currentFrameIndex = 0;

  function getCurrentFrame() {
    return frames[currentFrameIndex];
  }

  const updateApi = useUpdate(() => {
    if (timer.delta() > 0) {
      if (currentFrameIndex === frames.length - 1) {
        currentFrameIndex = 0;
      } else {
        currentFrameIndex++;
      }

      const currentFrame = getCurrentFrame();
      timer.set(currentFrame.duration);
    }
  });

  return {
    get currentFrame() {
      return getCurrentFrame();
    },

    pause() {
      timer.disable();
    },

    play() {
      timer.enable();
      timer.set(getCurrentFrame().duration);
    },

    restart() {
      currentFrameIndex = 0;
    },

    ...updateApi,
  };
}
