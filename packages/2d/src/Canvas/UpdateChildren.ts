import {
  useCallbackAsCurrent,
  useFrame,
  useStateAccumulator,
  useType,
  useEntity,
} from "@hex-engine/core";

const UPDATE_CALLBACKS = Symbol("UPDATE_CALLBACKS");

type UpdateCallback = (delta: number) => void;

/**
 * Registers a function to be called once every frame, prior to drawing.
 *
 * The function will receive a single argument, `delta`, which is the number of milliseconds
 * that have passed since the last frame was rendered.
 */
export function useUpdate(callback: UpdateCallback) {
  useStateAccumulator<UpdateCallback>(UPDATE_CALLBACKS).add(
    useCallbackAsCurrent(callback)
  );
}

/**
 * Once a frame, iterates over all of the current Entity's descendant Entities, calling
 * any update functions registered by their Components.
 */
export function UpdateChildren() {
  useType(UpdateChildren);

  useFrame((delta) => {
    const ent = useEntity();
    const ents = [ent, ...ent.descendants()];
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
