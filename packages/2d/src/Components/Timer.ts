import { useType } from "@hex-engine/core";
import { useUpdate } from "../Canvas";

function Timer() {
  useType(Timer);

  let target = 0;

  useUpdate((delta) => {
    target -= delta;
  });

  return {
    setToTimeFromNow(msFromNow: number) {
      target = msFromNow;
    },
    distanceFromSetTime() {
      return target;
    },
    hasReachedSetTime() {
      return target > 0;
    },
  };
}

export default Timer;
