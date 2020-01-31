import { useType } from "@hex-engine/core";
import { useUpdate } from "../Canvas";
import { Vector, Point, Angle } from "../Models";

const origin = new Point(0, 0);

/** This Component provides the current state of a connected Gamepad, if present. */
export default function Gamepad(
  options: Partial<{
    /**
     * A minimum amount that analog sticks on the gamepad must be pushed from
     * the center position before they register as having moved from the center position.
     *
     * This value can be from 0 to 1, but should usually be a small value, like 0.1.
     */
    deadzone: number;

    /**
     * An array of button names for the gamepad, cooresponding to the button indices in the
     * `gamepad.buttons` array, where `gamepad` is a gamepad returned from `navigator.getGamepads()`.
     *
     * If you do not provide a list of button names, then names for the buttons on a PlayStation controller
     * will be used, even if the connected controller is not a PlayStation controller.
     */
    buttonNames: Array<string>;

    /**
     * Which gamepad connected to the computer this Gamepad component represents, starting from 0.
     */
    gamepadIndex: number;
  }> = {}
) {
  useType(Gamepad);

  const state = {
    /** A `Vector` indicating which direction the left stick is being pressed in, and how far it's being pressed. */
    leftStick: new Vector(new Angle(0), 0),
    /** A `Vector` indicating which direction the right stick is being pressed in, and how far it's being pressed. */
    rightStick: new Vector(new Angle(0), 0),
    /** A Set containing all the names of the currently pressed buttons. */
    pressed: new Set<string>(),
    /**
     * A boolean indicating whether a gamepad is connected.
     *
     * Note that the way the Web Gamepad API works, controllers do not show as connected
     * until the user first presses a button.
     */
    present: false,

    /**
     * The configured deadzone for the gamepad; that is, a number
     * used as a minimum value that the analog sticks must be moved
     * from their center position before their effective position is
     * considered different from the center position.
     */
    deadzone: options.deadzone ?? 0.1,

    /**
     * The configured button names for the gamepad. These names coorespond to button indices
     * in the Web Gamepad API, and will be used in the `pressed` Set.
     */
    buttonNames: options.buttonNames ?? [
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

  /** Convert an analog stick's x and y positions to a Vector in Canvas-space. */
  function stickToVector(x: number, y: number) {
    const target = new Point(x, y);

    const vector = Vector.fromPoints(origin, target);
    if (Math.abs(vector.magnitude) < state.deadzone) {
      vector.magnitude = 0;
    }

    return vector;
  }

  function buttonName(index: number): string {
    return state.buttonNames[index] || "unknown button";
  }

  useUpdate(() => {
    const gamepad = navigator.getGamepads()[options.gamepadIndex ?? 0];
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

  return state;
}
