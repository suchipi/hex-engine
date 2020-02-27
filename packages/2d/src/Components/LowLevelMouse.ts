import {
  useType,
  useEnableDisable,
  useCallbackAsCurrent,
} from "@hex-engine/core";
import { Vector } from "../Models";
import { useContext, useUpdate, useEntityTransforms } from "../Hooks";

/** A Mouse event in Hex Engine. */
export class HexMouseEvent {
  /** The position of the cursor, relative to the current Entity's origin. */
  pos: Vector;

  /** The amount that the cursor has moved since the last frame. */
  delta: Vector;

  /** Which buttons were pressed during this event, or, in the case of a MouseUp event, which buttons were released. */
  buttons: {
    left: boolean;
    right: boolean;
    middle: boolean;
    mouse4: boolean;
    mouse5: boolean;
  };

  constructor(
    pos: Vector,
    delta: Vector,
    buttons: {
      left: boolean;
      right: boolean;
      middle: boolean;
      mouse4: boolean;
      mouse5: boolean;
    }
  ) {
    this.pos = pos;
    this.delta = delta;
    this.buttons = buttons;
  }
}

let firstClickHasHappened = false;
let pendingFirstClickHandlers: Array<() => void> = [];

/**
 * This function will run the provided function the first time a mouse click occurs.
 * Note that it only works if there is at least one `Mouse` or `LowLevelMouse` Component
 * loaded in your game when the first click occurs. To be on the safe side, you should
 * probably also add a LowLevelMouse or Mouse Component to the Component that calls useFirstClick.
 */
export function useFirstClick(handler: () => void) {
  pendingFirstClickHandlers.push(useCallbackAsCurrent(handler));

  return {
    /** Whether the first click has occurred. */
    get firstClickHasHappened() {
      return firstClickHasHappened;
    },
  };
}

/**
 * A low-level Mouse Component. It supports mousemove, mousedown, and mouseup events.
 * For click events, information about whether the cursor is within an Entity's geometry,
 * and clean separation between left-click, right-click, and middle-click events, use `Mouse` instead.
 */
export default function LowLevelMouse() {
  useType(LowLevelMouse);

  const storage = {
    moveCallbacks: new Set<(event: HexMouseEvent) => void>(),
    downCallbacks: new Set<(event: HexMouseEvent) => void>(),
    upCallbacks: new Set<(event: HexMouseEvent) => void>(),
    outCallbacks: new Set<(event: HexMouseEvent) => void>(),
    overCallbacks: new Set<(event: HexMouseEvent) => void>(),
  };

  const context = useContext();
  const canvas: HTMLCanvasElement = context.canvas;

  const transforms = useEntityTransforms();

  function translatePos(clientX: number, clientY: number): Vector {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;

    const x = (clientX - rect.left) / scaleX;
    const y = (clientY - rect.top) / scaleY;

    const untransformedPoint = new Vector(x, y);

    return transforms
      .matrixForWorldPosition()
      .inverse()
      .transformPoint(untransformedPoint);
  }

  let lastPos = new Vector(0, 0);
  const event = new HexMouseEvent(new Vector(0, 0), new Vector(0, 0), {
    left: false,
    right: false,
    middle: false,
    mouse4: false,
    mouse5: false,
  });
  function updateEvent({
    clientX,
    clientY,
    buttons = 0,
    button,
  }: {
    clientX: number;
    clientY: number;
    buttons?: number;
    button?: number;
  }) {
    event.pos = translatePos(clientX, clientY);
    event.delta.mutateInto(event.pos);
    event.delta.subtractMutate(lastPos);
    lastPos.mutateInto(event.pos);

    event.buttons.left = Boolean(buttons & 1) || button === 0;
    event.buttons.right = Boolean(buttons & 2) || button === 2;
    event.buttons.middle = Boolean(buttons & 4) || button === 1;
    event.buttons.mouse4 = Boolean(buttons & 8) || button === 3;
    event.buttons.mouse5 = Boolean(buttons & 16) || button === 4;
  }

  let pendingMove: null | (() => void) = null;
  let pendingDown: null | (() => void) = null;
  let pendingUp: null | (() => void) = null;

  const handleMouseMove = ({ clientX, clientY, buttons }: MouseEvent) => {
    pendingMove = () => {
      pendingMove = null;
      updateEvent({ clientX, clientY, buttons });
      storage.moveCallbacks.forEach((callback) => callback(event));
    };
  };
  const handleMouseDown = ({ clientX, clientY, button }: MouseEvent) => {
    if (!firstClickHasHappened) {
      firstClickHasHappened = true;
      pendingFirstClickHandlers.forEach((handler) => {
        handler();
      });
      pendingFirstClickHandlers = [];
    }

    pendingDown = () => {
      pendingDown = null;
      updateEvent({ clientX, clientY, button });
      storage.downCallbacks.forEach((callback) => callback(event));
    };
  };
  const handleMouseUp = ({ clientX, clientY, button }: MouseEvent) => {
    pendingUp = () => {
      pendingUp = null;
      updateEvent({ clientX, clientY, button });
      storage.upCallbacks.forEach((callback) => callback(event));
    };
  };

  const handleMouseOut = () => {
    storage.outCallbacks.forEach((callback) => callback(event));
  };

  const handleMouseOver = () => {
    storage.overCallbacks.forEach((callback) => callback(event));
  };

  let isTouching = false;
  const handleTouchStart = (ev: TouchEvent) => {
    ev.preventDefault();

    if (isTouching) return;

    if (!firstClickHasHappened) {
      firstClickHasHappened = true;
      pendingFirstClickHandlers.forEach((handler) => {
        handler();
      });
      pendingFirstClickHandlers = [];
    }

    const touches = ev.touches;
    if (touches.length < 1) return;
    const { clientX, clientY } = touches[0];
    const button = 0;

    pendingDown = () => {
      pendingDown = null;
      updateEvent({ clientX, clientY, button });
      storage.downCallbacks.forEach((callback) => callback(event));
    };

    isTouching = true;
  };
  const handleTouchMove = (ev: TouchEvent) => {
    ev.preventDefault();

    const touches = ev.touches;
    if (touches.length < 1) return;
    const { clientX, clientY } = touches[0];
    const button = 0;

    pendingMove = () => {
      pendingMove = null;
      updateEvent({ clientX, clientY, button });
      storage.moveCallbacks.forEach((callback) => callback(event));
    };
  };
  const handleTouchEnd = (ev: TouchEvent) => {
    ev.preventDefault();

    if (!isTouching) return;

    const touches = ev.changedTouches;
    if (touches.length < 1) return;
    const { clientX, clientY } = touches[0];
    const button = 0;

    pendingUp = () => {
      pendingUp = null;
      updateEvent({ clientX, clientY, button });
      storage.upCallbacks.forEach((callback) => callback(event));
    };

    isTouching = false;
  };

  useUpdate(() => {
    // Very important that we process move before down/up, so that touch screens work
    if (pendingMove) pendingMove();
    if (pendingDown) pendingDown();
    if (pendingUp) pendingUp();
  });

  let bound = false;

  function bindListeners(canvas: HTMLCanvasElement) {
    if (bound) return;
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseover", handleMouseOver);
    canvas.addEventListener("mouseout", handleMouseOut);

    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchend", handleTouchEnd);
    bound = true;
  }

  function unbindListeners(canvas: HTMLCanvasElement) {
    if (!bound) return;
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("mousedown", handleMouseDown);
    canvas.removeEventListener("mouseup", handleMouseUp);

    canvas.removeEventListener("touchstart", handleTouchStart);
    canvas.removeEventListener("touchmove", handleTouchMove);
    canvas.removeEventListener("touchend", handleTouchEnd);
    bound = false;
  }

  const { onEnabled, onDisabled } = useEnableDisable();

  onEnabled(() => {
    if (canvas) bindListeners(canvas);
  });

  onDisabled(() => {
    if (canvas) unbindListeners(canvas);
  });

  return {
    /** Registers the provided function to be called when the mouse cursor moves. */
    onMouseMove: (callback: (event: HexMouseEvent) => void) => {
      storage.moveCallbacks.add(useCallbackAsCurrent(callback));
    },
    /** Registers the provided function to be called when any button on the mouse is pressed down. */
    onMouseDown: (callback: (event: HexMouseEvent) => void) => {
      storage.downCallbacks.add(useCallbackAsCurrent(callback));
    },
    /** Registers the provided function to be called when any button on the mouse is released. */
    onMouseUp: (callback: (event: HexMouseEvent) => void) => {
      storage.upCallbacks.add(useCallbackAsCurrent(callback));
    },
    onCanvasLeave: (callback: (event: HexMouseEvent) => void) => {
      storage.outCallbacks.add(useCallbackAsCurrent(callback));
    },
    onCanvasEnter: (callback: (event: HexMouseEvent) => void) => {
      storage.overCallbacks.add(useCallbackAsCurrent(callback));
    },
  };
}
