import useEnableDisable from "../Hooks/useEnableDisable";

export default function RunLoop() {
  let frameRequest: number | null = null;
  let lastTimestamp: number | null = null;
  let onFrameCallbacks: Set<(delta: number) => void> = new Set();
  let isPaused = false;

  const { onEnabled, onDisabled, ...enableDisableApi } = useEnableDisable();

  function runFrameCallbacks(delta: number) {
    for (const onFrameCallback of onFrameCallbacks) {
      try {
        onFrameCallback(delta);
      } catch (err) {
        console.error(err);
      }
    }
  }

  function tick(timestamp: number) {
    if (lastTimestamp) {
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      runFrameCallbacks(delta);
    } else {
      lastTimestamp = timestamp;
    }
    frameRequest = requestAnimationFrame(tick);
  }

  function pause() {
    if (frameRequest != null) {
      cancelAnimationFrame(frameRequest);
    }
    isPaused = true;
  }

  function step() {
    frameRequest = requestAnimationFrame((timestamp: number) => {
      lastTimestamp = timestamp;
      runFrameCallbacks(16.667);
    });
  }

  function resume() {
    if (frameRequest != null) {
      cancelAnimationFrame(frameRequest);
    }
    frameRequest = requestAnimationFrame((timestamp) => {
      lastTimestamp = timestamp;
      frameRequest = requestAnimationFrame(tick);
    });
    isPaused = false;
  }

  onEnabled(function RunLoopEnabled() {
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
    pause,
    step,
    resume,
    getIsPaused: () => isPaused,
  };
}
