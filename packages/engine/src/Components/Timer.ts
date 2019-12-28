import { onUpdate } from "@hex-engine/core";

function Timer() {
  let target = 0;

  onUpdate((delta) => {
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
