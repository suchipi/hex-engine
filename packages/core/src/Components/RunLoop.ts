import HooksSystem from "../HooksSystem";
import useEnableDisable from "../Hooks/useEnableDisable";
import ErrorBoundary from "./ErrorBoundary";

const { useType, useEntity } = HooksSystem.hooks;

/**
 * An internal requestAnimationFrame-based RunLoop to be placed on
 * the root Entity.
 *
 * It lets you register callbacks that should be run every frame,
 * and also has controls to pause, step, and resume frames.
 *
 * In `@hex-engine/2d`, this Component is included as part of the
 * root `Canvas` component.
 *
 * The `pause`, `step`, `resume`, `isPaused`, and `frameNumber` functions
 * on the API object for this Component are used by `@hex-engine/inspector`.
 *
 * If you are using `@hex-engine/2d`, you do not need to use this Component
 * directly; use `Canvas` instead.
 */
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
      } catch (_err) {
        const err = _err as any;
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
    runFrameCallbacks(16.667);
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
    /**
     * Adds a function that should be called every frame.
     * @param callback The function to call every frame.
     */
    addFrameCallback(callback: (delta: number) => void) {
      onFrameCallbacks.add(callback);
    },
    /**
     * Removes a previously-added function, so that it is no longer
     * called every frame.
     * @param callback The function to no longer call every frame.
     */
    removeFrameCallback(callback: (delta: number) => void) {
      onFrameCallbacks.delete(callback);
    },

    /**
     * Stop running frame callbacks every animation frame.
     *
     * This is for debugging purposes.
     */
    pause,

    /**
     * Call all registered frame callbacks *once*, as if
     * one animation frame had passed.
     *
     * This is debugging purposes.
     */
    step,

    /**
     * Resume normal execution where frame callbacks are
     * called once per animation frame.
     *
     * This should be called after calling `pause`.
     */
    resume,

    /**
     * Whether frame callbacks are currently being called once
     * per animation frame or not.
     */
    isPaused: () => isPaused,

    /**
     * The current frame number. This number starts at zero
     * and increments by one every time the frame callbacks are called.
     *
     * This is for debugging purposes only.
     */
    get frameNumber() {
      return frameNumber;
    },
  };
}
