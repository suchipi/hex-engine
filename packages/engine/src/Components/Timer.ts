import HooksSystem from "../HooksSystem";

const { onUpdate } = HooksSystem.hooks;

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
