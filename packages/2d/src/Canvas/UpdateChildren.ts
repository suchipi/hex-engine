import {
  useCallbackAsCurrent,
  useDescendantEntities,
  useFrame,
  useEnableDisable,
  useStateAccumlator,
  useType,
} from "@hex-engine/core";

const UPDATE_CALLBACKS = Symbol("UPDATE_CALLBACKS");

type UpdateCallback = (delta: number) => void;

export function useUpdate(callback: UpdateCallback) {
  const { onDisabled, onEnabled, ...enableDisableApi } = useEnableDisable();

  useStateAccumlator<UpdateCallback>(UPDATE_CALLBACKS).add(
    useCallbackAsCurrent(callback)
  );

  return enableDisableApi;
}

export function UpdateChildren() {
  useType(UpdateChildren);

  return useFrame((delta) => {
    const ents = useDescendantEntities();
    for (const ent of ents) {
      for (const component of ent.components) {
        const comp = component as any;
        if (
          typeof comp.getIsEnabled !== "function" ||
          (typeof comp.getIsEnabled === "function" && comp.getIsEnabled())
        ) {
          const updateCallbacks = component.accumulatedState<UpdateCallback>(
            UPDATE_CALLBACKS
          );
          for (const updateCallback of updateCallbacks) {
            updateCallback(delta);
          }
        }
      }
    }
  });
}
