import { onUpdate } from "@hex-engine/core";
import { Vector, Point, Angle } from "../Models";

type Props = {
  deadzone: number;
  buttonNames: Array<string>;
};

export default function Gamepad(props: Partial<Props>) {
  const state = {
    leftStick: new Vector(new Angle(0), 0),
    rightStick: new Vector(new Angle(0), 0),
    pressed: new Set<string>(),
    present: false,
    deadzone: props.deadzone ?? 0.1,
    buttonNames: props.buttonNames ?? [
      "cross",
      "circle",
      "square",
      "triangle",
      "l1",
      "r1",
      "l2",
      "r2",
      "select",
      "start",
      "l3",
      "r3",
      "up",
      "down",
      "left",
      "right",
      "home",
    ],
  };

  function stickToVector(x: number, y: number) {
    const origin = new Point(0, 0);
    // Invert y component because gamepad
    // sticks are normal polar coordinate system
    const target = new Point(x, -y);

    const vector = Vector.fromPoints(origin, target);
    if (Math.abs(vector.magnitude) < state.deadzone) {
      vector.magnitude = 0;
    }

    return vector;
  }

  function buttonName(index: number): string {
    return state.buttonNames[index] || "unknown button";
  }

  onUpdate(() => {
    const gamepad = navigator.getGamepads()[0];
    if (gamepad == null) {
      state.present = false;
      return;
    }
    state.present = true;

    state.leftStick = stickToVector(gamepad.axes[0], gamepad.axes[1]);
    state.rightStick = stickToVector(gamepad.axes[2], gamepad.axes[3]);

    gamepad.buttons.forEach((button, index) => {
      const name = buttonName(index);
      if (button.pressed) {
        state.pressed.add(name);
      } else {
        state.pressed.delete(name);
      }
    });
  });

  // TODO: this can't mutate, so this component is useless. Need a new hook here
  return state;
}
