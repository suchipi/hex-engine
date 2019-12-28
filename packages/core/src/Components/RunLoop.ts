import useEnableDisable from "../Hooks/useEnableDisable";

export default function RunLoop() {
  let frameRequest: number | null = null;
  let lastTimestamp: number | null = null;
  let onFrameCallbacks: Set<(delta: number) => void> = new Set();

  const { onEnabled, onDisabled, ...enableDisableApi } = useEnableDisable();

  onEnabled(function RunLoopEnabled() {
    const tick = (timestamp: number) => {
      if (lastTimestamp) {
        const delta = timestamp - lastTimestamp;
        lastTimestamp = timestamp;

        for (const onFrameCallback of onFrameCallbacks) {
          try {
            onFrameCallback(delta);
          } catch (err) {
            console.error(err);
          }
        }
      } else {
        lastTimestamp = timestamp;
      }
      frameRequest = requestAnimationFrame(tick);
    };
    frameRequest = requestAnimationFrame(tick);
  });

  onDisabled(function RunLoopDisabled() {
    if (frameRequest != null) {
      cancelAnimationFrame(frameRequest);
    }
  });

  return {
    ...enableDisableApi,
    addFrameCallback(callback: (delta: number) => void) {
      onFrameCallbacks.add(callback);
    },
    removeFrameCallback(callback: (delta: number) => void) {
      onFrameCallbacks.delete(callback);
    },
  };
}
