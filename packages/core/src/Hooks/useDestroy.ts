import HooksSystem from "../HooksSystem";

const {
  useCallbackAsCurrent,
  useStateAccumulator,
  useEntity,
} = HooksSystem.hooks;

const ON_DESTROY = Symbol("ON_DESTROY");

export default function useDestroy() {
  const onDestroyState = useStateAccumulator<() => void>(ON_DESTROY);

  return {
    destroy: useCallbackAsCurrent(() => {
      const ent = useEntity();
      if (ent.parent) {
        onDestroyState.all().forEach((callback) => callback());
        ent.parent.removeChild(ent);
      } else {
        throw new Error("Cannot destroy the root entity");
      }
    }),
    onDestroy: (callback: () => void) => {
      onDestroyState.add(useCallbackAsCurrent(callback));
    },
  };
}
