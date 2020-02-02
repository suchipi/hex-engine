import {
  useType,
  useNewComponent,
  useCallbackAsCurrent,
  useEntity,
  Entity,
} from "@hex-engine/core";
import { useEntitiesAtPoint, useUpdate } from "../Hooks";
import LowLevelMouse, { HexMouseEvent } from "./LowLevelMouse";
import Geometry from "./Geometry";
import { Vector } from "../Models";

type Callback = (event: HexMouseEvent) => void;

export default function MousePosition({
  entity = useEntity(),
  geometry = entity.getComponent(Geometry),
}: {
  entity?: Entity | undefined;
  geometry?: ReturnType<typeof Geometry> | null;
} = {}) {
  useType(MousePosition);

  function pointIsWithinBounds(localPoint: Vector) {
    if (!geometry) return false;

    const worldPoint = geometry.worldPosition().addMutate(localPoint);
    return useEntitiesAtPoint(worldPoint)[0] === entity;
  }

  const storage = {
    onEnterCallbacks: new Set<Callback>(),
    onMoveCallbacks: new Set<Callback>(),
    onLeaveCallbacks: new Set<Callback>(),
  };

  const { onMouseMove } = useNewComponent(LowLevelMouse);

  let isInsideBounds = false;
  const position = new Vector(Infinity, Infinity);

  function handleEvent(event: HexMouseEvent) {
    position.mutateInto(event.pos);

    storage.onMoveCallbacks.forEach((callback) => callback(event));

    if (pointIsWithinBounds(event.pos)) {
      if (!isInsideBounds) {
        storage.onEnterCallbacks.forEach((callback) => callback(event));
      }
      isInsideBounds = true;
    } else if (isInsideBounds) {
      storage.onLeaveCallbacks.forEach((callback) => callback(event));
      isInsideBounds = false;
    }
  }

  onMouseMove(handleEvent);

  const callbackSetters = {
    onEnter(callback: Callback) {
      storage.onEnterCallbacks.add(useCallbackAsCurrent(callback));
    },
    onMove(callback: Callback) {
      storage.onMoveCallbacks.add(useCallbackAsCurrent(callback));
    },
    onLeave(callback: Callback) {
      storage.onLeaveCallbacks.add(useCallbackAsCurrent(callback));
    },
  };

  if (geometry) {
    // Handle the fact that isInsideBounds could change due to the entity moving
    // underneath the cursor.
    let lastEntPosition = geometry.position.clone();
    useUpdate(() => {
      const thisEntPosition = geometry.position;

      if (!thisEntPosition.equals(lastEntPosition)) {
        const diff = thisEntPosition.subtract(lastEntPosition);
        position.subtractMutate(diff);

        isInsideBounds = pointIsWithinBounds(position);

        lastEntPosition.mutateInto(thisEntPosition);
      }
    });
  }

  return {
    get isInsideBounds() {
      return isInsideBounds;
    },
    get position() {
      return position;
    },

    get onEnter() {
      return callbackSetters.onEnter;
    },
    get onMove() {
      return callbackSetters.onMove;
    },
    get onLeave() {
      return callbackSetters.onLeave;
    },
  };
}
