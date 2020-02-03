import { Entity, useNewComponent } from "@hex-engine/core";
import { useInspectorHover, useInspectorSelect } from "@hex-engine/inspector";
import Geometry from "../Components/Geometry";
import { useDraw } from "../Hooks";
import Mouse from "../Components/Mouse";

/**
 * Sets up the Inspector so that when the current Entity or Component is hovered over
 * in the canvas or from the Inspector tree, an outline around the geometry's shape
 * is drawn on screen. If the entity is being clicked on from the canvas and the
 * Inspector is in select mode, the entity will be reported to the Inspector and
 * expanded in the Inspector tree.
 *
 * This function does nothing in release builds.
 */
export default function useInspectorHoverOutline(
  getEntity: () => Entity,
  getGeometry: () => ReturnType<typeof Geometry>
) {
  if (process.env.NODE_ENV === "production") return;

  const entity = getEntity();
  const geometry = getGeometry();
  const shape = geometry.shape;

  const { onHoverStart, onHoverEnd } = useInspectorHover();
  const { getSelectMode, inspectEntity } = useInspectorSelect();

  const { onEnter, onLeave, onClick } = useNewComponent(() =>
    Mouse({ entity, geometry })
  );

  let hovered = false;

  onHoverStart(() => (hovered = true));
  onHoverEnd(() => (hovered = false));

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
      context.lineWidth = 3;
      context.strokeStyle = "magenta";
      shape.draw(context, "stroke");
    }
  });
}
