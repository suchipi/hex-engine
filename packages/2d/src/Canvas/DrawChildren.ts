import {
  useCallbackAsCurrent,
  useEntity,
  useFrame,
  useStateAccumulator,
  Component,
  useType,
} from "@hex-engine/core";
import { useCanvasDrawOrderSort } from "./DrawOrder";

const DRAW_CALLBACKS = Symbol("DRAW_CALLBACKS");

type DrawCallback = (
  context: CanvasRenderingContext2D,
  backstage: CanvasRenderingContext2D
) => void;

/**
 * Registers a function to be called once a frame, after all `useUpdate` functions have been called.
 *
 * Unlike `useDraw`, `useRawDraw` does *not* transform the context by the current Entity's matrix transform.
 *
 * In most cases, you should use `useDraw` instead of `useRawDraw`.
 */
export function useRawDraw(callback: DrawCallback) {
  useStateAccumulator<DrawCallback>(DRAW_CALLBACKS).add(
    useCallbackAsCurrent(callback)
  );
}

/**
 * Iterates over all the descendant Entities, and calls their registered
 * draw callbacks, in the order specified by the Canvas.DrawOrder component
 * on the root Entity, or a default order if there is no such component.
 */
export function DrawChildren({
  context,
  backstage,
  backgroundColor,
}: {
  context: CanvasRenderingContext2D;
  backstage: CanvasRenderingContext2D;
  backgroundColor: string;
}) {
  useType(DrawChildren);

  function drawComponent(component: Component) {
    if (component.isEnabled) {
      const drawCallbacks = component
        .stateAccumulator<DrawCallback>(DRAW_CALLBACKS)
        .all();
      for (const drawCallback of drawCallbacks) {
        drawCallback(context, backstage);
      }
    }
  }

  useFrame(() => {
    // Reset transform
    context.resetTransform();

    // Clear canvas
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    const sort = useCanvasDrawOrderSort();

    const ent = useEntity();
    const ents = [ent, ...ent.descendants()];
    const components = sort(ents);

    for (const component of components) {
      backstage.clearRect(
        0,
        0,
        backstage.canvas.width,
        backstage.canvas.height
      );
      drawComponent(component);
    }
  });
}
