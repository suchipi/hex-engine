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

export default function Mouse() {
  useType(Mouse);

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
      .asMatrix()
      .inverse()
      .transformPoint(untransformedPoint);
  }

  const moveState = useStateAccumulator<(pos: Point, delta: Point) => void>(
    MOUSE_MOVE
  );
  const downState = useStateAccumulator<(pos: Point) => void>(MOUSE_DOWN);
  const upState = useStateAccumulator<(pos: Point) => void>(MOUSE_UP);

  let pendingMove: null | (() => void) = null;
  let pendingDown: null | (() => void) = null;
  let pendingUp: null | (() => void) = null;

  let lastPos = new Point(0, 0);
  const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
    pendingMove = () => {
      pendingMove = null;
      const pos = translatePos(clientX, clientY);
      const delta = pos.subtract(lastPos);
      moveState.all().forEach((callback) => callback(pos, delta));
      lastPos = pos;
    };
  };
  const handleMouseDown = ({ clientX, clientY }: MouseEvent) => {
    if (!firstClickHasHappened) {
      firstClickHasHappened = true;
      pendingFirstClickHandlers.forEach((handler) => {
        handler();
      });
      pendingFirstClickHandlers = [];
    }

    pendingDown = () => {
      pendingDown = null;
      const pos = translatePos(clientX, clientY);
      downState.all().forEach((callback) => callback(pos));
    };
  };
  const handleMouseUp = ({ clientX, clientY }: MouseEvent) => {
    pendingUp = () => {
      pendingUp = null;
      const pos = translatePos(clientX, clientY);
      upState.all().forEach((callback) => callback(pos));
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
    onMouseMove: (callback: (pos: Point, delta: Point) => void) => {
      moveState.add(useCallbackAsCurrent(callback));
    },
    onMouseDown: (callback: (pos: Point) => void) => {
      downState.add(useCallbackAsCurrent(callback));
    },
    onMouseUp: (callback: (pos: Point) => void) => {
      upState.add(useCallbackAsCurrent(callback));
    },
  };
}
