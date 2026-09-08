import {
  useType,
  useNewComponent,
  useCallbackAsCurrent,
  useEntity,
  Entity,
} from "@hex-engine/core";
import { useEntitiesAtPoint, useEntityTransforms, useUpdate } from "../Hooks";
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

  const transforms = useEntityTransforms();

  function pointIsWithinBounds(localPoint: Vector) {
    if (!geometry) return false;

    const worldPoint = transforms
      .matrixForWorldPosition()
      .transformPoint(localPoint);
    return useEntitiesAtPoint(worldPoint)[0] === entity;
  }

  const storage = {
    onEnterCallbacks: new Set<Callback>(),
    onMoveCallbacks: new Set<Callback>(),
    onLeaveCallbacks: new Set<Callback>(),
  };

  const lowLevelMouse = useNewComponent(LowLevelMouse);

  let isInsideBounds = false;
  const position = new Vector(Infinity, Infinity);

  function updateBounds(event: HexMouseEvent) {
    if (pointIsWithinBounds(event.pos)) {
      if (!isInsideBounds) {
        isInsideBounds = true;
        storage.onEnterCallbacks.forEach((callback) => callback(event));
      }
    } else if (isInsideBounds) {
      isInsideBounds = false;
      storage.onLeaveCallbacks.forEach((callback) => callback(event));
    }
  }

  // The Entity can move out from under (or in under) a stationary cursor, and
  // there is no mouse event to hand to onEnter/onLeave when it does.
  const entityMovedEvent = new HexMouseEvent(
    new Vector(0, 0),
    new Vector(0, 0),
    { left: false, right: false, middle: false, mouse4: false, mouse5: false }
  );

  function handleEvent(event: HexMouseEvent) {
    position.mutateInto(event.pos);

    entityMovedEvent.buttons.left = event.buttons.left;
    entityMovedEvent.buttons.right = event.buttons.right;
    entityMovedEvent.buttons.middle = event.buttons.middle;
    entityMovedEvent.buttons.mouse4 = event.buttons.mouse4;
    entityMovedEvent.buttons.mouse5 = event.buttons.mouse5;

    storage.onMoveCallbacks.forEach((callback) => callback(event));

    updateBounds(event);
  }

  lowLevelMouse.onMouseMove(handleEvent);

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
    const lastEntPosition = geometry.position.clone();
    useUpdate(() => {
      const thisEntPosition = geometry.position;

      if (!thisEntPosition.equals(lastEntPosition)) {
        const diff = thisEntPosition.subtract(lastEntPosition);
        position.subtractMutate(diff);
        lastEntPosition.mutateInto(thisEntPosition);

        entityMovedEvent.type = "move";
        entityMovedEvent.pos.mutateInto(position);
        entityMovedEvent.delta.mutateInto(diff);
        entityMovedEvent.delta.oppositeMutate();

        updateBounds(entityMovedEvent);
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

    /**
     * Registered on the same LowLevelMouse this Component listens to, so that
     * handlers run after isInsideBounds has been brought up to date for the
     * frame.
     */
    get onMouseDown() {
      return lowLevelMouse.onMouseDown;
    },
    get onMouseUp() {
      return lowLevelMouse.onMouseUp;
    },
  };
}
