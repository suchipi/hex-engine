import {
  useCallbackAsCurrent,
  useDescendantEntities,
  useFrame,
  useStateAccumlator,
} from "@hex-engine/core";

const DRAW_CALLBACKS = Symbol("DRAW_CALLBACKS");

type DrawCallback = (
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) => void;

export function useDraw(callback: DrawCallback) {
  // TODO: useEnableDisable in here

  useStateAccumlator<DrawCallback>(DRAW_CALLBACKS).add(
    useCallbackAsCurrent(callback)
  );
}

type Props = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  backgroundColor: string;
};

export function DrawChildren({ canvas, context, backgroundColor }: Props) {
  return useFrame(() => {
    // Reset transform
    context.setTransform(1, 0, 0, 1, 0, 0);

    // Clear canvas
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const ents = useDescendantEntities();
    for (const ent of ents) {
      for (const component of ent.components) {
        const callbacks = component.accumulatedState<DrawCallback>(
          DRAW_CALLBACKS
        );
        for (const callback of callbacks) {
          callback(context, canvas);
        }
      }
    }
  });
}
