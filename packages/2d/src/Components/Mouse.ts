import {
  useType,
  useExistingComponentByType,
  useNewComponent,
  useStateAccumlator,
  useCallbackAsCurrent,
} from "@hex-engine/core";
import CanvasMouse from "./CanvasMouse";
import Origin from "./Origin";
import Position from "./Position";
import { Vec2 } from "../Models";

const ON_ENTER = Symbol("ON_ENTER");
const ON_MOVE = Symbol("ON_MOVE");
const ON_LEAVE = Symbol("ON_LEAVE");
const ON_DOWN = Symbol("ON_DOWN");
const ON_UP = Symbol("ON_UP");
const ON_CLICK = Symbol("ON_CLICK");
type Callback = (pos: Vec2) => void;

export default function Mouse({ bounds }: { bounds: Vec2 }) {
  useType(Mouse);

  const position = useExistingComponentByType(Position);

  function pointIsWithinBounds(point: Vec2) {
    const pos = position?.asWorldPosition() || new Vec2(0, 0);
    const origin = useExistingComponentByType(Origin) || new Vec2(0, 0);

    const topLeft = pos.subtract(origin);
    const bottomRight = topLeft.add(bounds);

    return (
      point.x >= topLeft.x &&
      point.y >= topLeft.y &&
      point.x <= bottomRight.x &&
      point.y <= bottomRight.y
    );
  }

  const onEnterState = useStateAccumlator<Callback>(ON_ENTER);
  const onMoveState = useStateAccumlator<Callback>(ON_MOVE);
  const onLeaveState = useStateAccumlator<Callback>(ON_LEAVE);
  const onDownState = useStateAccumlator<Callback>(ON_DOWN);
  const onUpState = useStateAccumlator<Callback>(ON_UP);
  const onClickState = useStateAccumlator<Callback>(ON_CLICK);

  const { onMouseMove, onMouseDown, onMouseUp } = useNewComponent(CanvasMouse);

  let isHovering = false;
  let isPressing = false;

  onMouseMove((pos) => {
    if (pointIsWithinBounds(pos)) {
      const localPos = position?.getLocalPosition(pos) || pos;
      if (!isHovering) {
        onEnterState.all().forEach((callback) => callback(localPos));
      }
      isHovering = true;

      onMoveState.all().forEach((callback) => callback(localPos));
    } else if (isHovering) {
      const localPos = position?.getLocalPosition(pos) || pos;
      onLeaveState.all().forEach((callback) => callback(localPos));
      isHovering = false;
    }
  });

  onMouseDown((pos) => {
    if (pointIsWithinBounds(pos)) {
      const localPos = position?.getLocalPosition(pos) || pos;
      isPressing = true;
      onDownState.all().forEach((callback) => callback(localPos));
    }
  });

  onMouseUp((pos) => {
    if (pointIsWithinBounds(pos)) {
      const localPos = position?.getLocalPosition(pos) || pos;
      onUpState.all().forEach((callback) => callback(localPos));
      if (isPressing) {
        onClickState.all().forEach((callback) => callback(localPos));
      }
    }
    isPressing = false;
  });

  return {
    get isHovering() {
      return isHovering;
    },
    get isPressing() {
      return isPressing;
    },

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
}
