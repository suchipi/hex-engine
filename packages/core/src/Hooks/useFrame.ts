import HooksSystem from "../HooksSystem";
import useRootEntity from "./useRootEntity";
import useEnableDisable from "./useEnableDisable";
import RunLoop from "../Components/RunLoop";
const { useCallbackAsCurrent } = HooksSystem.hooks;

export default function useFrame(callback: (delta: number) => void) {
  // Defer this setup until a tick from now,
  // because they will most likely add this component
  // to the tree synchronously. We can't rely on entity lifecycle here because
  // it might be the root component that's calling useFrame.
  setTimeout(
    useCallbackAsCurrent(() => {
      const root = useRootEntity();
      const runLoopApi = root.getComponent(RunLoop);
      if (!runLoopApi) {
        throw new Error(
          "Attempted to call useFrame, but the root entity for the component did not have a RunLoop component on it. Please add a RunLoop to your root entity- or, maybe you forgot to add a child entity to the tree?"
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
    }),
    0
  );
}
