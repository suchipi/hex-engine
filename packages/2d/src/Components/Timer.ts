import { useType } from "@hex-engine/core";
import { useUpdate } from "../Canvas";

/** This Component can be used to check how far the current time is from some desired time in the future. */
function Timer() {
  useType(Timer);

  let target = 0;

  useUpdate((delta) => {
    target -= delta;
  });

  return {
    get target() {
      return target;
    },

    setToTimeFromNow(msFromNow: number) {
      target = msFromNow;
    },
    distanceFromSetTime() {
      return target;
    },
    hasReachedSetTime() {
      return target < 0;
    },
  };
}

export default Timer;
