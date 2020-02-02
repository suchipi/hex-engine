import HooksSystem from "../HooksSystem";
import useRootEntity from "./useRootEntity";
import useEnableDisable from "./useEnableDisable";
import RunLoop from "../Components/RunLoop";
import useNewRootComponent from "./useNewRootComponent";
const { useCallbackAsCurrent } = HooksSystem.hooks;

/**
 * Register a function to be called once every animation frame.
 *
 * If you are using `@hex-engine/2d`, you probably don't want to use this; use `useUpdate` or `useDraw` instead.
 * @param callback The function to be called once per frame.
 */
export default function useFrame(callback: (delta: number) => void) {
  const root = useRootEntity();
  const runLoopApi = root.getComponent(RunLoop) || useNewRootComponent(RunLoop);
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
