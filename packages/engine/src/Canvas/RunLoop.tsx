import { onEnabled, onDisabled } from "core";

type Data = {
  onFrame: (delta: number) => void;
};

export default function RunLoop({ onFrame }: Data) {
  let frameRequest: number | null = null;
  let lastTimestamp: number | null = null;

  onEnabled(() => {
    const tick = (timestamp: number) => {
      if (lastTimestamp) {
        const delta = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        onFrame(delta);
      } else {
        lastTimestamp = timestamp;
      }
      frameRequest = requestAnimationFrame(tick);
    };
    frameRequest = requestAnimationFrame(tick);
  });

  onDisabled(() => {
    if (frameRequest != null) {
      cancelAnimationFrame(frameRequest);
    }
  });
}
