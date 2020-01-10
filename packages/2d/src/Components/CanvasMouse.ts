import {
  useType,
  useEnableDisable,
  useStateAccumlator,
  useRootEntity,
  useCallbackAsCurrent,
} from "@hex-engine/core";
import Canvas, { useUpdate, useRawDraw } from "../Canvas";
import { Vec2 } from "../Models";

const MOUSE_MOVE = Symbol("MOUSE_MOVE");
const MOUSE_DOWN = Symbol("MOUSE_DOWN");
const MOUSE_UP = Symbol("MOUSE_UP");

export default function CanvasMouse() {
  useType(CanvasMouse);

  let context: CanvasRenderingContext2D;
  // TODO: need a way to get the context without needing to call into useDraw every frame
  useRawDraw((ctx) => {
    context = ctx;
  });

  function translatePos(clientX: number, clientY: number): Vec2 {
    const canvas = context.canvas;

    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;

    const x = (clientX - rect.left) / scaleX;
    const y = (clientY - rect.top) / scaleY;

    const untransformedPos = new Vec2(x, y);

    const inverseContextMatrix = context.getTransform().inverse();

    return untransformedPos.transformUsingMatrix(inverseContextMatrix);
  }

  const moveState = useStateAccumlator<(pos: Vec2, delta: Vec2) => void>(
    MOUSE_MOVE
  );
  const downState = useStateAccumlator<(pos: Vec2) => void>(MOUSE_DOWN);
  const upState = useStateAccumlator<(pos: Vec2) => void>(MOUSE_UP);

  let pendingMove: null | (() => void) = null;
  let pendingDown: null | (() => void) = null;
  let pendingUp: null | (() => void) = null;

  let lastPos = new Vec2(0, 0);
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

  let canvas: HTMLCanvasElement | undefined = undefined;

  const root = useRootEntity();
  canvas = root.getComponent(Canvas)?.element;
  if (!canvas) {
    throw new Error(
      "Could not find the root canvas. Does the root entity have a Canvas component?"
    );
  }

  const { onEnabled, onDisabled } = useEnableDisable();

  onEnabled(() => {
    if (canvas) bindListeners(canvas);
  });

  onDisabled(() => {
    if (canvas) unbindListeners(canvas);
  });

  return {
    onMouseMove: (callback: (pos: Vec2, delta: Vec2) => void) => {
      moveState.add(useCallbackAsCurrent(callback));
    },
    onMouseDown: (callback: (pos: Vec2) => void) => {
      downState.add(useCallbackAsCurrent(callback));
    },
    onMouseUp: (callback: (pos: Vec2) => void) => {
      upState.add(useCallbackAsCurrent(callback));
    },
  };
}
