import {
  useType,
  useNewComponent,
  useStateAccumulator,
  useCallbackAsCurrent,
  useEntity,
} from "@hex-engine/core";
import Mouse from "./Mouse";
import Geometry from "./Geometry";
import { Point } from "../Models";

const ON_ENTER = Symbol("ON_ENTER");
const ON_MOVE = Symbol("ON_MOVE");
const ON_LEAVE = Symbol("ON_LEAVE");
const ON_DOWN = Symbol("ON_DOWN");
const ON_UP = Symbol("ON_UP");
const ON_CLICK = Symbol("ON_CLICK");
type Callback = (pos: Point) => void;

export default function Pointer() {
  useType(Pointer);

  const geometry = useEntity().getComponent(Geometry);

  function pointIsWithinBounds(point: Point) {
    const shape = geometry?.shape;
    if (!shape) return false;

    return shape.containsPoint(point);
  }

  const onEnterState = useStateAccumulator<Callback>(ON_ENTER);
  const onMoveState = useStateAccumulator<Callback>(ON_MOVE);
  const onLeaveState = useStateAccumulator<Callback>(ON_LEAVE);
  const onDownState = useStateAccumulator<Callback>(ON_DOWN);
  const onUpState = useStateAccumulator<Callback>(ON_UP);
  const onClickState = useStateAccumulator<Callback>(ON_CLICK);

  const { onMouseMove, onMouseDown, onMouseUp } = useNewComponent(Mouse);

  let isInsideBounds = false;
  let isPressing = false;

  onMouseMove((pos) => {
    if (pointIsWithinBounds(pos)) {
      if (!isInsideBounds) {
        onEnterState.all().forEach((callback) => callback(pos));
      }
      isInsideBounds = true;

      onMoveState.all().forEach((callback) => callback(pos));
    } else if (isInsideBounds) {
      onLeaveState.all().forEach((callback) => callback(pos));
      isInsideBounds = false;
    }
  });

  onMouseDown((pos) => {
    if (pointIsWithinBounds(pos)) {
      isPressing = true;
      onDownState.all().forEach((callback) => callback(pos));
    }
  });

  onMouseUp((pos) => {
    if (pointIsWithinBounds(pos)) {
      onUpState.all().forEach((callback) => callback(pos));
      if (isPressing) {
        onClickState.all().forEach((callback) => callback(pos));
      }
    }
    isPressing = false;
  });

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
    onDown(callback: Callback) {
      onDownState.add(useCallbackAsCurrent(callback));
    },
    onUp(callback: Callback) {
      onUpState.add(useCallbackAsCurrent(callback));
    },
    onClick(callback: Callback) {
      onClickState.add(useCallbackAsCurrent(callback));
    },
  };

  return {
    get isInsideBounds() {
      return isInsideBounds;
    },
    get isPressing() {
      return isPressing;
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
    get onDown() {
      return callbackSetters.onDown;
    },
    get onUp() {
      return callbackSetters.onUp;
    },
    get onClick() {
      return callbackSetters.onClick;
    },
  };
}
