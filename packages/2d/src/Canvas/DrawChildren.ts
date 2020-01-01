import {
  useCallbackAsCurrent,
  useDescendantEntities,
  useFrame,
  useStateAccumlator,
  useEnableDisable,
  Component,
} from "@hex-engine/core";

const DRAW_CALLBACKS = Symbol("DRAW_CALLBACKS");

type DrawCallback = (
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) => void;

export function useDraw(callback: DrawCallback) {
  const { onDisabled, onEnabled, ...enableDisableApi } = useEnableDisable();

  useStateAccumlator<DrawCallback>(DRAW_CALLBACKS).add(
    useCallbackAsCurrent(callback)
  );

  return enableDisableApi;
}

type Props = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  backgroundColor: string;
};

export function DrawChildren({ canvas, context, backgroundColor }: Props) {
  function drawComponent(component: Component) {
    const comp = component as any;
    if (
      typeof comp.getIsEnabled !== "function" ||
      (typeof comp.getIsEnabled === "function" && comp.getIsEnabled())
    ) {
      const drawCallbacks = component.accumulatedState<DrawCallback>(
        DRAW_CALLBACKS
      );
      for (const drawCallback of drawCallbacks) {
        drawCallback(context, canvas);
      }
    }
  }

  return useFrame(() => {
    // Reset transform
    context.setTransform(1, 0, 0, 1, 0, 0);

    // Clear canvas
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const ents = useDescendantEntities();

    // Draw cameras first
    for (const ent of ents) {
      for (const component of [...ent.components].filter(
        (comp: any) => comp.isCamera
      )) {
        drawComponent(component);
      }
    }

    // Then draw non-cameras
    for (const ent of ents) {
      for (const component of [...ent.components].filter(
        (comp: any) => !comp.isCamera
      )) {
        drawComponent(component);
      }
    }
  });
}
