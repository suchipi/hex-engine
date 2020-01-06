import {
  useType,
  useExistingComponentByType,
  useNewComponent,
  useStateAccumlator,
  useCallbackAsCurrent,
} from "@hex-engine/core";
import BoundingBox from "./BoundingBox";
import Mouse from "./Mouse";
import Origin from "./Origin";
import Position from "./Position";
import { Vec2 } from "../Models";

const ON_ENTER = Symbol("ON_ENTER");
const ON_LEAVE = Symbol("ON_LEAVE");
const ON_DOWN = Symbol("ON_DOWN");
const ON_UP = Symbol("ON_UP");
const ON_CLICK = Symbol("ON_CLICK");
type Callback = () => void;

export default function Clickable() {
  useType(Clickable);

  const boundingBox = useExistingComponentByType(BoundingBox)!;
  if (!boundingBox) {
    throw new Error(
      "The Clickable component requires a BoundingBox component on the same entity."
    );
  }

  const position =
    useExistingComponentByType(Position)?.asWorldPosition() || new Vec2(0, 0);
  const origin = useExistingComponentByType(Origin) || new Vec2(0, 0);

  function pointIsWithinBounds(point: Vec2) {
    const topLeft = position.subtract(origin);
    const bottomRight = topLeft.add(boundingBox);

    return (
      point.x >= topLeft.x &&
      point.y >= topLeft.y &&
      point.x <= bottomRight.x &&
      point.y <= bottomRight.y
    );
  }

  const onEnterState = useStateAccumlator<Callback>(ON_ENTER);
  const onLeaveState = useStateAccumlator<Callback>(ON_LEAVE);
  const onDownState = useStateAccumlator<Callback>(ON_DOWN);
  const onUpState = useStateAccumlator<Callback>(ON_UP);
  const onClickState = useStateAccumlator<Callback>(ON_CLICK);

  const {
    onMouseMove,
    onMouseDown,
    onMouseUp,
    ...enableDisableApi
  } = useNewComponent(Mouse);

  let isHovering = false;
  let isPressing = false;

  onMouseMove((pos) => {
    if (pointIsWithinBounds(pos)) {
      if (!isHovering) {
        onEnterState.all().forEach((callback) => callback());
      }
      isHovering = true;
    } else if (isHovering) {
      onLeaveState.all().forEach((callback) => callback());
      isHovering = false;
    }
  });

  onMouseDown((pos) => {
    if (pointIsWithinBounds(pos)) {
      isPressing = true;
      onDownState.all().forEach((callback) => callback());
    }
  });

  onMouseUp((pos) => {
    if (pointIsWithinBounds(pos)) {
      onUpState.all().forEach((callback) => callback());
      if (isPressing) {
        onClickState.all().forEach((callback) => callback());
      }
    }
    isPressing = false;
  });

  return {
    ...enableDisableApi,

    get isHovering() {
      return isHovering;
    },
    get isPressing() {
      return isPressing;
    },

    onEnter(callback: Callback) {
      onEnterState.add(useCallbackAsCurrent(callback));
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
