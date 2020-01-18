import { useType } from "@hex-engine/core";
import { useUpdate } from "../Canvas";

// TODO: I imitated the impact js API here, but it's not very intuitive.
// I should rename these methods.
function Timer() {
  useType(Timer);

  let target = 0;

  useUpdate((delta) => {
    target += delta;
  });

  return {
    set(msFromNow: number) {
      target = -msFromNow;
    },
    delta() {
      return target;
    },
  };
}

export default Timer;
