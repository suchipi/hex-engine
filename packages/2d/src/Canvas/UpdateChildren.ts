import {
  useCallbackAsCurrent,
  useDescendantEntities,
  useFrame,
  useStateAccumulator,
  useType,
} from "@hex-engine/core";

const UPDATE_CALLBACKS = Symbol("UPDATE_CALLBACKS");

type UpdateCallback = (delta: number) => void;

export function useUpdate(callback: UpdateCallback) {
  useStateAccumulator<UpdateCallback>(UPDATE_CALLBACKS).add(
    useCallbackAsCurrent(callback)
  );
}

export function UpdateChildren() {
  useType(UpdateChildren);

  useFrame((delta) => {
    const ents = useDescendantEntities();
    for (const ent of ents) {
      for (const component of ent.components) {
        if (component.isEnabled) {
          const updateCallbacks = component
            .stateAccumulator<UpdateCallback>(UPDATE_CALLBACKS)
            .all();
          for (const updateCallback of updateCallbacks) {
            updateCallback(delta);
          }
        }
      }
    }
  });
}
