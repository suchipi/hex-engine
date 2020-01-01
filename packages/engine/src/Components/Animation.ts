import { useNewComponent } from "@hex-engine/core";
import { useUpdate } from "../Canvas";
import Timer from "./Timer";

export class AnimationFrame {
  data: number;
  duration: number; // in ms
  onFrame: (() => void) | null;

  constructor(
    data: number,
    { duration, onFrame }: { duration: number; onFrame?: null | (() => void) }
  ) {
    this.data = data;
    this.duration = duration;
    this.onFrame = onFrame || null;
  }
}

type Props = Array<AnimationFrame>;

export type AnimationAPI = {
  currentFrame: AnimationFrame;
  pause(): void;
  play(): void;
  restart(): void;

  // updateApi
  getIsEnabled: () => boolean;
  enable: () => void;
  disable: () => void;
};

export default function Animation(props: Props): AnimationAPI {
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

      if (currentFrame.onFrame) {
        currentFrame.onFrame();
      }
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
