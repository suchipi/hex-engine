import { useNewComponent, useEntity } from "@hex-engine/core";
import { useInspectorSelect } from "@hex-engine/inspector";
import Geometry from "../Components/Geometry";
import { useDraw } from "../Hooks";
import Mouse from "../Components/Mouse";

/**
 * Sets up the Inspector so that if the Inspector is in select mode,
 * any Entity that has a Geometry component and is hovered in world space
 * will be highlighted. Clicks on highlighted Entities will report them to
 * the Inspector.
 *
 * This function does nothing in release builds.
 */
export default function useInspectorHoverOutline(
  getGeometry: () => ReturnType<typeof Geometry>
) {
  if (process.env.NODE_ENV === "production") return;

  const entity = useEntity();
  const geometry = getGeometry();

  if (geometry === undefined) {
    return;
  }

  const { getSelectMode, inspectEntity } = useInspectorSelect();

  const { onEnter, onLeave, onClick } = useNewComponent(() =>
    Mouse({ entity, geometry })
  );

  let hovered = false;

  onEnter(() => {
    if (getSelectMode()) {
      hovered = true;
    }
  });

  onLeave(() => {
    if (getSelectMode()) {
      hovered = false;
    }
  });

  onClick(() => {
    if (getSelectMode()) {
      hovered = false;
      inspectEntity(entity);
    }
  });

  useDraw((context) => {
    if (hovered) {
      const shape = geometry!.shape;
      const color = "#B076C7";
      const alpha = 0.35;
      const previousAlpha = context.globalAlpha;

      context.fillStyle = color;
      context.globalAlpha = alpha;
      shape.draw(context, "fill");
      context.globalAlpha = previousAlpha;

      context.lineWidth = 3;
      context.strokeStyle = color;
      shape.draw(context, "stroke");
    }
  });
}
