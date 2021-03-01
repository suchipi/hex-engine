import { useType } from "@hex-engine/core";
import { useUpdate } from "../Hooks";

/**
 * This Component can be used to measure time.
 *
 * Usage:
 * ```ts
 * // Create a timer
 * const timer = useNewComponent(Timer);
 *
 * // Set it to some time in the future
 * timer.setToTimeFromNow(100);
 *
 * // Use its `alpha` property to get a number between one and zero
 * // representing how close the current time is to the set time:
 * timer.alpha; // 0
 * // If you wait 50ms and then check again...
 * timer.alpha; // 0.5
 * // And 50 more ms...
 * timer.alpha; // 1
 * ```
 *
 * The `alpha` property is clamped between 0 and 1. If you want the "raw"
 * value, that goes above 1 after you've gone beyond the set time, use the
 * `unclampedAlpha` property instead:
 * ```ts
 * const timer = useNewComponent(Timer);
 * timer.setToTimeFromNow(100);
 *
 * timer.alpha; // 0
 * timer.unclampedAlpha; // 0
 * // If you wait 100ms and then check again...
 * timer.alpha; // 1
 * timer.unclampedAlpha; // 1
 * // And 50 more ms...
 * timer.alpha; // 1
 * timer.unclampedAlpha; // 1.5
 * // And 50 more ms...
 * timer.alpha; // 1
 * timer.unclampedAlpha; // 2
 * ```
 */
function Timer() {
  useType(Timer);

  let currentTime = 0;
  let startTime = 0;
  let endTime = 0;

  useUpdate((delta) => {
    currentTime += delta;
  });

  function setToTimeFromNow(msFromNow: number) {
    startTime = currentTime;
    endTime = currentTime + msFromNow;
  }

  function getUnclampedAlpha() {
    const frame = endTime - startTime;
    const progression = currentTime - startTime;
    if (frame === 0) {
      // Consider the timer complete if the timeframe it's measuring is 0.
      // If we don't do this, we end up doing 0/0 which results in NaN
      return 1;
    } else {
      return progression / frame;
    }
  }

  return {
    /**
     * "Sets" the Timer to the provided number of milliseconds in the future.
     * This value is used to calculate `alpha` and `unclampedAlpha`.
     */
    setToTimeFromNow,

    /**
     * A number between 0 and 1 representing how close the current time is to
     * the set time. Immediately after calling `setToTimeFromNow`, it will
     * have the value 0. Once the amount of time passed into `setToTimeFromNow`
     * has elapsed, it will have the value 1. In the time in-between, its value
     * will be between 0 and 1.
     *
     * After the set time has elapsed, its value will remain at 1. For a value
     * that continues to grow above 1, use `unclampedAlpha`.
     */
    get alpha() {
      return Math.min(Math.max(0, getUnclampedAlpha()), 1);
    },

    /**
     * Like `alpha`, but its value continues to grow beyond 1 after the set
     * time has elapsed.
     */
    get unclampedAlpha() {
      return getUnclampedAlpha();
    },
  };
}

export default Timer;
