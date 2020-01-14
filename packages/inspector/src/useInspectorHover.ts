import { useStateAccumulator, useCallbackAsCurrent } from "@hex-engine/core";

export const HOVER_BEGIN = Symbol("INSPECTOR_HOVER_BEGIN");
export const HOVER_END = Symbol("INSPECTOR_HOVER_END");
type Callback = () => void;

export default function useInspectorHover() {
  const beginState = useStateAccumulator<Callback>(HOVER_BEGIN);
  const endState = useStateAccumulator<Callback>(HOVER_END);

  const api = {
    isHovered: false,
    onHoverStart(callback: () => void) {
      beginState.add(useCallbackAsCurrent(callback));
    },
    onHoverEnd(callback: () => void) {
      endState.add(useCallbackAsCurrent(callback));
    },
  };

  api.onHoverStart(() => (api.isHovered = true));
  api.onHoverEnd(() => (api.isHovered = false));

  return api;
}
