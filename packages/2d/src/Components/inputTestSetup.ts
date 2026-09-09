import {
  Component,
  Entity,
  RunLoop,
  createRoot,
  useNewComponent,
  useType,
} from "@hex-engine/core";
import Canvas from "../Canvas";

export const CANVAS_SIZE = 400;

let canvasElement: HTMLCanvasElement | null = null;
let rootEntity: Entity | null = null;

function currentCanvasElement(): HTMLCanvasElement {
  if (canvasElement == null) {
    throw new Error("startGame has not been called yet");
  }
  return canvasElement;
}

function currentRootEntity(): Entity {
  if (rootEntity == null) {
    throw new Error("startGame has not been called yet");
  }
  return rootEntity;
}

/**
 * Creates a root Entity with a Canvas, runs `scene` on it, and leaves the
 * RunLoop paused so that frames only happen when `step` is called.
 *
 * The canvas is placed so that its bounding rect is exactly
 * `(0, 0, cssSize, cssSize)`, which means the client coordinates given to the
 * dispatch helpers in this file are also canvas coordinates (unless `cssSize`
 * and `canvasSize` differ, which scales them).
 */
export function startGame(
  scene: () => void,
  {
    canvasSize = CANVAS_SIZE,
    cssSize = CANVAS_SIZE,
  }: { canvasSize?: number; cssSize?: number } = {}
): Entity {
  document.body.style.margin = "0";
  document.body.style.padding = "0";

  const element = document.createElement("canvas");
  element.style.position = "absolute";
  element.style.left = "0px";
  element.style.top = "0px";
  document.body.appendChild(element);
  canvasElement = element;

  rootEntity = createRoot(function MouseTestRoot() {
    useType(MouseTestRoot);

    const canvas = useNewComponent(() =>
      Canvas({ element, backgroundColor: null })
    );
    canvas.resize({
      realWidth: cssSize,
      realHeight: cssSize,
      pixelWidth: canvasSize,
      pixelHeight: canvasSize,
    });

    scene();
  });

  runLoop().pause();

  return rootEntity;
}

/** Tears down whatever `startGame` created. Call this from `afterEach`. */
export function endGame() {
  if (rootEntity != null) {
    rootEntity.destroy();
  }
  rootEntity = null;

  if (canvasElement != null && canvasElement.parentNode != null) {
    canvasElement.parentNode.removeChild(canvasElement);
  }
  canvasElement = null;
}

export function runLoop(): ReturnType<typeof RunLoop> & Component {
  const component = currentRootEntity().getComponent(RunLoop);
  if (component == null) {
    throw new Error("The root Entity has no RunLoop");
  }
  return component;
}

/** Runs one frame: every update callback, then every draw callback. */
export function step() {
  runLoop().step();
}

export function canvasBoundingRect(): DOMRect {
  return currentCanvasElement().getBoundingClientRect();
}

function dispatchMouseEvent(type: string, init: MouseEventInit) {
  currentCanvasElement().dispatchEvent(
    new MouseEvent(type, { bubbles: true, ...init })
  );
}

export function mouseMove(x: number, y: number, buttons: number = 0) {
  dispatchMouseEvent("mousemove", { clientX: x, clientY: y, buttons });
}

export function mouseDown(x: number, y: number, button: number = 0) {
  dispatchMouseEvent("mousedown", { clientX: x, clientY: y, button });
}

export function mouseUp(x: number, y: number, button: number = 0) {
  dispatchMouseEvent("mouseup", { clientX: x, clientY: y, button });
}

export function mouseOver(x: number, y: number) {
  dispatchMouseEvent("mouseover", { clientX: x, clientY: y });
}

export function mouseOut(x: number, y: number) {
  dispatchMouseEvent("mouseout", { clientX: x, clientY: y });
}

function dispatchTouchEvent(
  type: string,
  x: number,
  y: number,
  stillTouching: boolean
) {
  const element = currentCanvasElement();
  const touch = new Touch({
    identifier: 1,
    target: element,
    clientX: x,
    clientY: y,
  });

  element.dispatchEvent(
    new TouchEvent(type, {
      bubbles: true,
      cancelable: true,
      touches: stillTouching ? [touch] : [],
      targetTouches: stillTouching ? [touch] : [],
      changedTouches: [touch],
    })
  );
}

export function touchStart(x: number, y: number) {
  dispatchTouchEvent("touchstart", x, y, true);
}

export function touchMove(x: number, y: number) {
  dispatchTouchEvent("touchmove", x, y, true);
}

export function touchEnd(x: number, y: number) {
  dispatchTouchEvent("touchend", x, y, false);
}

function dispatchKeyboardEvent(type: string, key: string, repeat: boolean) {
  const event = new KeyboardEvent(type, {
    key,
    repeat,
    bubbles: true,
    cancelable: true,
  });
  document.body.dispatchEvent(event);
  return event.defaultPrevented;
}

/** Returns whether the event's default was prevented. */
export function keyDown(key: string, { repeat = false } = {}): boolean {
  return dispatchKeyboardEvent("keydown", key, repeat);
}

/** Returns whether the event's default was prevented. */
export function keyUp(key: string, { repeat = false } = {}): boolean {
  return dispatchKeyboardEvent("keyup", key, repeat);
}

/** Snapshots a Vector as a plain object, so that assertions don't see later mutations. */
export function xy(vector: { x: number; y: number }): { x: number; y: number } {
  return { x: vector.x, y: vector.y };
}
