import {
  useType,
  useEnableDisable,
  useStateAccumlator,
  useRootEntity,
  useEntityLifecycle,
  useCallbackAsCurrent,
} from "@hex-engine/core";
import Canvas from "../Canvas";
import { Vec2 } from "../Models";

const MOUSE_MOVE = Symbol("MOUSE_MOVE");
const MOUSE_DOWN = Symbol("MOUSE_DOWN");
const MOUSE_UP = Symbol("MOUSE_UP");

export default function Mouse() {
  useType(Mouse);

  function translatePos(event: MouseEvent): Vec2 {
    const canvas = event.currentTarget as HTMLCanvasElement;

    const { clientX, clientY } = event;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;

    const x = (clientX - rect.left) / scaleX;
    const y = (clientY - rect.top) / scaleY;

    return new Vec2(x, y);
  }

  const moveState = useStateAccumlator<(pos: Vec2, delta: Vec2) => void>(
    MOUSE_MOVE
  );
  const downState = useStateAccumlator<(pos: Vec2) => void>(MOUSE_DOWN);
  const upState = useStateAccumlator<(pos: Vec2) => void>(MOUSE_UP);

  let lastPos = new Vec2(0, 0);
  const handleMouseMove = (event: MouseEvent) => {
    const pos = translatePos(event);
    const delta = pos.subtract(lastPos);
    moveState.all().forEach((callback) => callback(pos, delta));
    lastPos = pos;
  };
  const handleMouseDown = (event: MouseEvent) => {
    const pos = translatePos(event);
    downState.all().forEach((callback) => callback(pos));
  };
  const handleMouseUp = (event: MouseEvent) => {
    const pos = translatePos(event);
    upState.all().forEach((callback) => callback(pos));
  };

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

  useEntityLifecycle({
    onAddedToParent: () => {
      const root = useRootEntity();
      canvas = root.getComponent(Canvas)?.element;
      if (!canvas) {
        throw new Error(
          "Could not find the root canvas. Does the root entity have a Canvas component?"
        );
      }
      bindListeners(canvas);
    },
    onRemovedFromParent: () => {
      if (canvas) {
        unbindListeners(canvas);
      }
    },
  });

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
