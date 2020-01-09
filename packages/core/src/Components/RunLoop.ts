import HooksSystem from "../HooksSystem";
import useEnableDisable from "../Hooks/useEnableDisable";
import ErrorBoundary from "./ErrorBoundary";

const { useType, useEntity } = HooksSystem.hooks;

export default function RunLoop() {
  useType(RunLoop);

  const ent = useEntity();

  let frameNumber: number = 0;
  let frameRequest: number | null = null;
  let lastTimestamp: number | null = null;
  let onFrameCallbacks: Set<(delta: number) => void> = new Set();
  let isPaused = false;

  const { onEnabled, onDisabled } = useEnableDisable();

  function runFrameCallbacks(delta: number) {
    frameNumber++;
    for (const onFrameCallback of onFrameCallbacks) {
      try {
        onFrameCallback(delta);
      } catch (err) {
        ErrorBoundary.runHandlers(ent, err);
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
    if (!isPaused) {
      frameRequest = requestAnimationFrame(tick);
    }
  }

  function pause() {
    if (frameRequest != null) {
      cancelAnimationFrame(frameRequest);
    }
    isPaused = true;
  }

  function step() {
    if (frameRequest != null) {
      cancelAnimationFrame(frameRequest);
    }

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
    if (frameRequest != null) {
      cancelAnimationFrame(frameRequest);
    }
    frameRequest = requestAnimationFrame(tick);
  });

  onDisabled(function RunLoopDisabled() {
    if (frameRequest != null) {
      cancelAnimationFrame(frameRequest);
    }
  });

  return {
    addFrameCallback(callback: (delta: number) => void) {
      onFrameCallbacks.add(callback);
    },
    removeFrameCallback(callback: (delta: number) => void) {
      onFrameCallbacks.delete(callback);
    },
    pause,
    step,
    resume,
    isPaused: () => isPaused,
    get frameNumber() {
      return frameNumber;
    },
  };
}
