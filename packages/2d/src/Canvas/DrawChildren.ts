import {
  useCallbackAsCurrent,
  useDescendantEntities,
  useEntity,
  useFrame,
  useStateAccumulator,
  Component,
  useType,
} from "@hex-engine/core";
import DrawOrder from "./DrawOrder";

const DRAW_CALLBACKS = Symbol("DRAW_CALLBACKS");

type DrawCallback = (
  context: CanvasRenderingContext2D,
  backstage: CanvasRenderingContext2D
) => void;

export function useRawDraw(callback: DrawCallback) {
  useStateAccumulator<DrawCallback>(DRAW_CALLBACKS).add(
    useCallbackAsCurrent(callback)
  );
}

type Props = {
  context: CanvasRenderingContext2D;
  backstage: CanvasRenderingContext2D;
  backgroundColor: string;
};

export function DrawChildren({ context, backstage, backgroundColor }: Props) {
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

    const drawOrder = useEntity().getComponent(DrawOrder);
    const sort = drawOrder ? drawOrder.sort : DrawOrder.defaultSort;

    const ents = useDescendantEntities();
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
