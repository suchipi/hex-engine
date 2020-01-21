import { useStateAccumulator, useCallbackAsCurrent } from "@hex-engine/core";

export const HOVER_BEGIN = Symbol("INSPECTOR_HOVER_BEGIN");
export const HOVER_END = Symbol("INSPECTOR_HOVER_END");
type Callback = () => void;

/**
 * Returns an object with three properties:
 *
 * - `isHovered`: Whether the current Component, Entity, or one of its parents is
 * currently being hovered over in the Inspector.
 * - `onHoverStart`: Register a function to be run when the user starts hovering over
 * the current Component, Entity, or one of its parents in the Inspector.
 * - `onHoverEnd`: Register a function to be run when the user stops hovering over
 * the current Component, Entity, or one of its parents in the Inspector.
 *
 * The idea here is that when someone hovers over the Component or Entity in the
 * Inspector, you visually highlight the corresponding rendered objects, if any.
 */
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
