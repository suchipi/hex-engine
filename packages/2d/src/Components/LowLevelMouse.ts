import {
  useType,
  useEnableDisable,
  useCallbackAsCurrent,
} from "@hex-engine/core";
import { Vector } from "../Models";
import { useContext, useUpdate, useEntityTransforms } from "../Hooks";

/** The kinds of event a `HexMouseEvent` can report. */
export type HexMouseEventType =
  | "move"
  | "down"
  | "up"
  | "canvasEnter"
  | "canvasLeave";

type Buttons = {
  left: boolean;
  right: boolean;
  middle: boolean;
  mouse4: boolean;
  mouse5: boolean;
};

/**
 * A Mouse event in Hex Engine.
 *
 * Note that each `LowLevelMouse` Component reuses one instance of this class
 * for every event it delivers, mutating it in place, in order to avoid
 * allocating garbage on every frame. Do not hold onto the event you are given;
 * copy whatever you need off of it instead.
 */
export class HexMouseEvent {
  /** The position of the cursor, relative to the current Entity's origin. */
  pos: Vector;

  /** Which kind of event this instance is currently reporting. */
  type: HexMouseEventType;

  /** Which buttons were pressed during this event, or, in the case of a MouseUp event, which buttons were released. */
  buttons: Buttons;

  // One delta per event type: each is measured from the previous event of that
  // same type, so a single shared Vector would let, say, a mousedown reset the
  // position that the next mousemove measures itself against.
  private deltas: Record<HexMouseEventType, Vector>;

  constructor(
    pos: Vector,
    delta: Vector,
    buttons: Buttons,
    type: HexMouseEventType = "move"
  ) {
    this.pos = pos;
    this.type = type;
    this.buttons = buttons;
    this.deltas = {
      move: delta,
      down: delta.clone(),
      up: delta.clone(),
      canvasEnter: delta.clone(),
      canvasLeave: delta.clone(),
    };
  }

  /** The amount that the cursor has moved since the last event of this same type. */
  get delta(): Vector {
    return this.deltas[this.type];
  }
}

let firstClickHasHappened = false;
let pendingFirstClickHandlers: Array<() => void> = [];

function runFirstClickHandlers() {
  if (firstClickHasHappened) return;

  firstClickHasHappened = true;
  pendingFirstClickHandlers.forEach((handler) => {
    handler();
  });
  pendingFirstClickHandlers = [];
}

/**
 * This function will run the provided function the first time a mouse click occurs.
 * If the first click has already happened, the function is run immediately.
 *
 * Note that it only works if there is at least one `Mouse` or `LowLevelMouse` Component
 * loaded in your game when the first click occurs. To be on the safe side, you should
 * probably also add a LowLevelMouse or Mouse Component to the Component that calls useFirstClick.
 */
export function useFirstClick(handler: () => void) {
  const wrappedHandler = useCallbackAsCurrent(handler);

  if (firstClickHasHappened) {
    wrappedHandler();
  } else {
    pendingFirstClickHandlers.push(wrappedHandler);
  }

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
export default function LowLevelMouse({
  positionsRelativeTo = "owning-entity",
}: {
  /** Determines what the pos property on the HexMouseEvents from this component should be relative to. */
  positionsRelativeTo?: "owning-entity" | "world" | "screen";
} = {}) {
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

    const point = new Vector(x, y);

    switch (positionsRelativeTo) {
      case "screen": {
        return point;
      }
      case "world": {
        // screen -> world
        const canvasTransform = context.getTransform();
        point.transformUsingMatrixMutate(canvasTransform.inverse());

        return point;
      }
      case "owning-entity": {
        // screen -> world
        const canvasTransform = context.getTransform();
        point.transformUsingMatrixMutate(canvasTransform.inverse());

        // world -> ent
        transforms
          .matrixForWorldPosition()
          .inverse()
          .transformPointMutate(point);

        return point;
      }
    }
  }

  const lastPositions: Record<HexMouseEventType, Vector> = {
    move: new Vector(0, 0),
    down: new Vector(0, 0),
    up: new Vector(0, 0),
    canvasEnter: new Vector(0, 0),
    canvasLeave: new Vector(0, 0),
  };
  const event = new HexMouseEvent(new Vector(0, 0), new Vector(0, 0), {
    left: false,
    right: false,
    middle: false,
    mouse4: false,
    mouse5: false,
  });

  function updateEvent({
    type,
    clientX,
    clientY,
    buttons = 0,
    button,
  }: {
    type: HexMouseEventType;
    clientX: number;
    clientY: number;
    buttons?: number;
    button?: number;
  }) {
    event.type = type;
    event.pos = translatePos(clientX, clientY);

    const lastPos = lastPositions[type];
    event.delta.mutateInto(event.pos);
    event.delta.subtractMutate(lastPos);
    lastPos.mutateInto(event.pos);

    event.buttons.left = Boolean(buttons & 1) || button === 0;
    event.buttons.right = Boolean(buttons & 2) || button === 2;
    event.buttons.middle = Boolean(buttons & 4) || button === 1;
    event.buttons.mouse4 = Boolean(buttons & 8) || button === 3;
    event.buttons.mouse5 = Boolean(buttons & 16) || button === 4;
  }

  let pendingEvents: Array<() => void> = [];

  const handleMouseMove = ({ clientX, clientY, buttons }: MouseEvent) => {
    pendingEvents.push(() => {
      updateEvent({ type: "move", clientX, clientY, buttons });
      storage.moveCallbacks.forEach((callback) => callback(event));
    });
  };

  const handleMouseOver = ({ clientX, clientY, buttons }: MouseEvent) => {
    pendingEvents.push(() => {
      updateEvent({ type: "canvasEnter", clientX, clientY, buttons });
      storage.overCallbacks.forEach((callback) => callback(event));
    });
  };

  const handleMouseOut = ({ clientX, clientY, buttons }: MouseEvent) => {
    pendingEvents.push(() => {
      updateEvent({ type: "canvasLeave", clientX, clientY, buttons });
      storage.outCallbacks.forEach((callback) => callback(event));
    });
  };

  const handleMouseDown = ({ clientX, clientY, button }: MouseEvent) => {
    runFirstClickHandlers();

    pendingEvents.push(() => {
      updateEvent({ type: "down", clientX, clientY, button });
      storage.downCallbacks.forEach((callback) => callback(event));
    });
  };

  const handleMouseUp = ({ clientX, clientY, button }: MouseEvent) => {
    pendingEvents.push(() => {
      updateEvent({ type: "up", clientX, clientY, button });
      storage.upCallbacks.forEach((callback) => callback(event));
    });
  };

  let isTouching = false;
  const handleTouchStart = (ev: TouchEvent) => {
    ev.preventDefault();

    if (isTouching) return;

    runFirstClickHandlers();

    const touches = ev.touches;
    if (touches.length < 1) return;
    const { clientX, clientY } = touches[0];
    const button = 0;

    // A touch has no cursor to have moved beforehand, so report where it landed
    // before reporting the press. Listeners that care about what is under the
    // cursor have nothing else to go on.
    pendingEvents.push(() => {
      updateEvent({ type: "move", clientX, clientY, button });
      storage.moveCallbacks.forEach((callback) => callback(event));
    });
    pendingEvents.push(() => {
      updateEvent({ type: "down", clientX, clientY, button });
      storage.downCallbacks.forEach((callback) => callback(event));
    });

    isTouching = true;
  };
  const handleTouchMove = (ev: TouchEvent) => {
    ev.preventDefault();

    const touches = ev.touches;
    if (touches.length < 1) return;
    const { clientX, clientY } = touches[0];
    const button = 0;

    pendingEvents.push(() => {
      updateEvent({ type: "move", clientX, clientY, button });
      storage.moveCallbacks.forEach((callback) => callback(event));
    });
  };
  const handleTouchEnd = (ev: TouchEvent) => {
    ev.preventDefault();

    if (!isTouching) return;

    const touches = ev.changedTouches;
    if (touches.length < 1) return;
    const { clientX, clientY } = touches[0];
    const button = 0;

    pendingEvents.push(() => {
      updateEvent({ type: "up", clientX, clientY, button });
      storage.upCallbacks.forEach((callback) => callback(event));
    });

    isTouching = false;
  };

  useUpdate(() => {
    // Every event the browser gave us since the last frame, in the order it
    // gave them to us. A move has to reach listeners before the down that
    // followed it, or anything that hit-tests acts on a stale position.
    const eventsThisFrame = pendingEvents;
    pendingEvents = [];

    for (const deliverEvent of eventsThisFrame) {
      deliverEvent();
    }
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
    canvas.removeEventListener("mouseover", handleMouseOver);
    canvas.removeEventListener("mouseout", handleMouseOut);

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
    pendingEvents = [];
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
    /** Registers the provided function to be called when the mouse exits the canvas. */
    onCanvasLeave: (callback: (event: HexMouseEvent) => void) => {
      storage.outCallbacks.add(useCallbackAsCurrent(callback));
    },
    /** Registers the provided function to be called when the mouse enters the canvas. */
    onCanvasEnter: (callback: (event: HexMouseEvent) => void) => {
      storage.overCallbacks.add(useCallbackAsCurrent(callback));
    },
  };
}
