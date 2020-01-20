import {
  useType,
  useNewComponent,
  useStateAccumulator,
  useCallbackAsCurrent,
  useEntity,
  Entity,
} from "@hex-engine/core";
import LowLevelMouse, { HexMouseEvent } from "./LowLevelMouse";
import MousePosition from "./MousePosition";
import Geometry from "./Geometry";

const ON_DOWN = Symbol("ON_DOWN");
const ON_UP = Symbol("ON_UP");
const ON_CLICK = Symbol("ON_CLICK");
const ON_RIGHT_CLICK = Symbol("ON_RIGHT_CLICK");
const ON_MIDDLE_CLICK = Symbol("ON_MIDDLE_CLICK");
type Callback = (event: HexMouseEvent) => void;

export default function Mouse({
  entity = useEntity(),
  geometry = entity.getComponent(Geometry),
}: {
  entity?: Entity | undefined;
  geometry?: ReturnType<typeof Geometry> | null;
} = {}) {
  useType(Mouse);

  const onDownState = useStateAccumulator<Callback>(ON_DOWN);
  const onUpState = useStateAccumulator<Callback>(ON_UP);
  const onClickState = useStateAccumulator<Callback>(ON_CLICK);
  const onRightClickState = useStateAccumulator<Callback>(ON_RIGHT_CLICK);
  const onMiddleClickState = useStateAccumulator<Callback>(ON_MIDDLE_CLICK);

  const { onMouseDown, onMouseUp } = useNewComponent(LowLevelMouse);
  const mousePosition = useNewComponent(() =>
    MousePosition({ entity, geometry })
  );

  let pressingLeft = false;
  let pressingRight = false;
  let pressingMiddle = false;

  onMouseDown((event) => {
    if (!mousePosition.isInsideBounds) return;
    const { buttons } = event;

    if (buttons.left) {
      pressingLeft = true;
      onDownState.all().forEach((callback) => callback(event));
    }
    if (buttons.right) {
      pressingRight = true;
    }
    if (buttons.middle) {
      pressingMiddle = true;
    }
  });

  onMouseUp((event) => {
    const { buttons } = event;

    if (mousePosition.isInsideBounds) {
      if (pressingLeft && buttons.left) {
        onClickState.all().forEach((callback) => callback(event));
      }
      if (pressingRight && buttons.right) {
        onRightClickState.all().forEach((callback) => callback(event));
      }
      if (pressingMiddle && buttons.middle) {
        onMiddleClickState.all().forEach((callback) => callback(event));
      }
    }

    if (buttons.left) {
      pressingLeft = false;
      onUpState.all().forEach((callback) => callback(event));
    }
    if (buttons.right) {
      pressingRight = false;
    }
    if (buttons.middle) {
      pressingMiddle = false;
    }
  });

  const callbackSetters = {
    onDown(callback: (event: HexMouseEvent) => void) {
      onDownState.add(useCallbackAsCurrent(callback));
    },
    onUp(callback: (event: HexMouseEvent) => void) {
      onUpState.add(useCallbackAsCurrent(callback));
    },
    onClick(callback: (event: HexMouseEvent) => void) {
      onClickState.add(useCallbackAsCurrent(callback));
    },
    onRightClick(callback: (event: HexMouseEvent) => void) {
      onRightClickState.add(useCallbackAsCurrent(callback));
    },
    onMiddleClick(callback: (event: HexMouseEvent) => void) {
      onMiddleClickState.add(useCallbackAsCurrent(callback));
    },
  };

  return {
    get isInsideBounds() {
      return mousePosition.isInsideBounds;
    },
    get isPressingLeft() {
      return pressingLeft;
    },
    get isPressingRight() {
      return pressingRight;
    },
    get isPressingMiddle() {
      return pressingMiddle;
    },
    get position() {
      return mousePosition.position;
    },

    get onEnter() {
      return mousePosition.onEnter;
    },
    get onMove() {
      return mousePosition.onMove;
    },
    get onLeave() {
      return mousePosition.onLeave;
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
    get onRightClick() {
      return callbackSetters.onRightClick;
    },
    get onMiddleClick() {
      return callbackSetters.onMiddleClick;
    },
  };
}
