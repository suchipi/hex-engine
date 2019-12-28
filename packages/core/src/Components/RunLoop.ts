import HooksSystem from "../HooksSystem";
const { _getInstance, onEnabled, onDisabled } = HooksSystem.hooks;

type Props = {
  onFrame: (delta: number) => void;
};

export default function RunLoop({ onFrame }: Props) {
  const instance = _getInstance();

  let frameRequest: number | null = null;
  let lastTimestamp: number | null = null;

  onEnabled(() => {
    const tick = (timestamp: number) => {
      if (lastTimestamp) {
        const delta = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        HooksSystem.withInstance(instance, () => {
          onFrame(delta);
        });
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
