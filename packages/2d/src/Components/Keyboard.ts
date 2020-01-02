import { useEnableDisable, useType } from "@hex-engine/core";
import { Vector, Angle } from "../Models";

export default function Keyboard() {
  useType(Keyboard);

  const pressed: Set<string> = new Set();

  const processKeydown = (event: KeyboardEvent) => {
    if (event.repeat) {
      return;
    }
    pressed.add(event.key);
  };

  const processKeyup = (event: KeyboardEvent) => {
    if (event.repeat) {
      return;
    }
    pressed.delete(event.key);
  };

  const { onEnabled, onDisabled, ...enableDisableApi } = useEnableDisable();

  onEnabled(() => {
    document.addEventListener("keydown", processKeydown);
    document.addEventListener("keyup", processKeyup);
  });

  onDisabled(() => {
    document.removeEventListener("keydown", processKeydown);
    document.removeEventListener("keyup", processKeyup);
  });

  return {
    ...enableDisableApi,
    pressed,
    vectorFromKeys(
      upKey: string,
      downKey: string,
      leftKey: string,
      rightKey: string
    ): Vector {
      const pressedKeys = pressed;
      let angle = 0;
      let magnitude = 1;

      const half = Math.PI;
      const quarter = Math.PI / 2;
      const eighth = Math.PI / 4;

      if (pressedKeys.has(upKey) && pressedKeys.has(rightKey)) {
        // up right
        angle = -eighth;
      } else if (pressedKeys.has(upKey) && pressedKeys.has(leftKey)) {
        // up left
        angle = half + eighth;
      } else if (pressedKeys.has(downKey) && pressedKeys.has(rightKey)) {
        // down right
        angle = eighth;
      } else if (pressedKeys.has(downKey) && pressedKeys.has(leftKey)) {
        // down left
        angle = quarter + eighth;
      } else if (pressedKeys.has(upKey) && !pressedKeys.has(downKey)) {
        // up
        angle = -quarter;
      } else if (pressedKeys.has(downKey) && !pressedKeys.has(upKey)) {
        // down
        angle = quarter;
      } else if (pressedKeys.has(leftKey) && !pressedKeys.has(rightKey)) {
        // left
        angle = half;
      } else if (pressedKeys.has(rightKey) && !pressedKeys.has(leftKey)) {
        // right
        angle = 0;
      } else {
        magnitude = 0;
      }

      return new Vector(new Angle(angle), magnitude);
    },
  };
}
