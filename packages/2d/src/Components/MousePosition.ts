import {
  useType,
  useNewComponent,
  useStateAccumulator,
  useCallbackAsCurrent,
  useEntity,
  Entity,
} from "@hex-engine/core";
import { useUpdate } from "../Canvas";
import { useEntitiesAtPoint } from "../Hooks";
import LowLevelMouse, { HexMouseEvent } from "./LowLevelMouse";
import Geometry from "./Geometry";
import { Point } from "../Models";

const ON_ENTER = Symbol("ON_ENTER");
const ON_MOVE = Symbol("ON_MOVE");
const ON_LEAVE = Symbol("ON_LEAVE");
type Callback = (event: HexMouseEvent) => void;

export default function MousePosition({
  entity = useEntity(),
  geometry = entity.getComponent(Geometry),
}: {
  entity?: Entity | undefined;
  geometry?: ReturnType<typeof Geometry> | null;
} = {}) {
  useType(MousePosition);

  function pointIsWithinBounds(localPoint: Point) {
    if (!geometry) return false;

    const worldPoint = geometry.worldPosition().addMutate(localPoint);
    return useEntitiesAtPoint(worldPoint)[0] === entity;
  }

  const onEnterState = useStateAccumulator<Callback>(ON_ENTER);
  const onMoveState = useStateAccumulator<Callback>(ON_MOVE);
  const onLeaveState = useStateAccumulator<Callback>(ON_LEAVE);

  const { onMouseMove } = useNewComponent(LowLevelMouse);

  let isInsideBounds = false;
  const position = new Point(Infinity, Infinity);

  function handleEvent(event: HexMouseEvent) {
    position.mutateInto(event.pos);

    onMoveState.all().forEach((callback) => callback(event));

    if (pointIsWithinBounds(event.pos)) {
      if (!isInsideBounds) {
        onEnterState.all().forEach((callback) => callback(event));
      }
      isInsideBounds = true;
    } else if (isInsideBounds) {
      onLeaveState.all().forEach((callback) => callback(event));
      isInsideBounds = false;
    }
  }

  onMouseMove(handleEvent);

  const callbackSetters = {
    onEnter(callback: Callback) {
      onEnterState.add(useCallbackAsCurrent(callback));
    },
    onMove(callback: Callback) {
      onMoveState.add(useCallbackAsCurrent(callback));
    },
    onLeave(callback: Callback) {
      onLeaveState.add(useCallbackAsCurrent(callback));
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
        position.addMutate(diff);

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
