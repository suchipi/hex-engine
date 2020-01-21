import HooksSystem from "../HooksSystem";
import useRootEntity from "./useRootEntity";
import useEnableDisable from "./useEnableDisable";
import RunLoop from "../Components/RunLoop";
const { useCallbackAsCurrent } = HooksSystem.hooks;

/**
 * Register a function to be called once every animation frame, via the root Entity's `RunLoop`.
 *
 * If you are using `@hex-engine/2d`, you probably don't want to use this; use `useUpdate` or `useDraw` instead.
 * @param callback The function to be called once per frame.
 */
export default function useFrame(callback: (delta: number) => void) {
  const root = useRootEntity();
  const runLoopApi = root.getComponent(RunLoop);
  if (!runLoopApi) {
    throw new Error(
      "Attempted to call useFrame, but the root entity for the component did not have a RunLoop component on it. Please add a RunLoop to your root entity."
    );
  }
  const { addFrameCallback, removeFrameCallback } = runLoopApi;

  const wrappedCallback = useCallbackAsCurrent(callback);

  const { onDisabled, onEnabled } = useEnableDisable();
  onEnabled(() => {
    addFrameCallback(wrappedCallback);
  });

  onDisabled(() => {
    removeFrameCallback(wrappedCallback);
  });
}
