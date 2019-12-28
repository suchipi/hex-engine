import { useUpdate } from "../Canvas";

function Timer() {
  let target = 0;

  const updateApi = useUpdate((delta) => {
    target += delta;
  });

  return {
    set(msFromNow: number) {
      target = -msFromNow;
    },
    delta() {
      return target;
    },
    ...updateApi,
  };
}

export default Timer;
