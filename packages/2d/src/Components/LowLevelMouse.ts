import {
  useType,
  useEnableDisable,
  useStateAccumulator,
  useCallbackAsCurrent,
} from "@hex-engine/core";
import { useUpdate } from "../Canvas";
import { Point } from "../Models";
import { useContext, useEntityTransforms } from "../Hooks";

const MOUSE_MOVE = Symbol("MOUSE_MOVE");
const MOUSE_DOWN = Symbol("MOUSE_DOWN");
const MOUSE_UP = Symbol("MOUSE_UP");

export type HexMouseEvent = {
  pos: Point;
  delta: Point;
  buttons: {
    left: boolean;
    right: boolean;
    middle: boolean;
    mouse4: boolean;
    mouse5: boolean;
  };
};

let firstClickHasHappened = false;
let pendingFirstClickHandlers: Array<() => void> = [];

export function useFirstClick(handler: () => void) {
  pendingFirstClickHandlers.push(useCallbackAsCurrent(handler));

  return {
    get firstClickHasHappened() {
      return firstClickHasHappened;
    },
  };
}

export default function LowLevelMouse() {
  useType(LowLevelMouse);

  const context = useContext();
  const canvas: HTMLCanvasElement = context.canvas;

  const transforms = useEntityTransforms();

  function translatePos(clientX: number, clientY: number): Point {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;

    const x = (clientX - rect.left) / scaleX;
    const y = (clientY - rect.top) / scaleY;

    const untransformedPoint = new Point(x, y);

    return transforms
      .matrixForWorldPosition()
      .inverse()
      .transformPoint(untransformedPoint);
  }

  let lastPos = new Point(0, 0);
  const event: HexMouseEvent = {
    pos: new Point(0, 0),
    delta: new Point(0, 0),
    buttons: {
      left: false,
      right: false,
      middle: false,
      mouse4: false,
      mouse5: false,
    },
  };
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

  const moveState = useStateAccumulator<(event: HexMouseEvent) => void>(
    MOUSE_MOVE
  );
  const downState = useStateAccumulator<(event: HexMouseEvent) => void>(
    MOUSE_DOWN
  );
  const upState = useStateAccumulator<(event: HexMouseEvent) => void>(MOUSE_UP);

  let pendingMove: null | (() => void) = null;
  let pendingDown: null | (() => void) = null;
  let pendingUp: null | (() => void) = null;

  const handleMouseMove = ({ clientX, clientY, buttons }: MouseEvent) => {
    pendingMove = () => {
      pendingMove = null;
      updateEvent({ clientX, clientY, buttons });
      moveState.all().forEach((callback) => callback(event));
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
      downState.all().forEach((callback) => callback(event));
    };
  };
  const handleMouseUp = ({ clientX, clientY, button }: MouseEvent) => {
    pendingUp = () => {
      pendingUp = null;
      updateEvent({ clientX, clientY, button });
      upState.all().forEach((callback) => callback(event));
    };
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
    bound = true;
  }

  function unbindListeners(canvas: HTMLCanvasElement) {
    if (!bound) return;
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("mousedown", handleMouseDown);
    canvas.removeEventListener("mouseup", handleMouseUp);
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
    onMouseMove: (callback: (event: HexMouseEvent) => void) => {
      moveState.add(useCallbackAsCurrent(callback));
    },
    onMouseDown: (callback: (event: HexMouseEvent) => void) => {
      downState.add(useCallbackAsCurrent(callback));
    },
    onMouseUp: (callback: (event: HexMouseEvent) => void) => {
      upState.add(useCallbackAsCurrent(callback));
    },
  };
}
