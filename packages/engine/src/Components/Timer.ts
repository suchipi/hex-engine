import makeComponentClass from "../makeComponentClass";

const Timer = makeComponentClass(({ onUpdate }) => {
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
});

export default Timer;
