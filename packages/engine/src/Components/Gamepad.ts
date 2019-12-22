import Component from "./Component";
import {
  Vector,
  makeVector,
  makePoint,
  pointsToVector,
  makeAngle,
} from "../Models";

type Data = {
  deadzone: number;
  buttonNames: Array<string>;
};

export default class Gamepad extends Component<Data> {
  leftStick: Vector = makeVector(makeAngle(0), 0);
  rightStick: Vector = makeVector(makeAngle(0), 0);
  pressed: Set<string> = new Set();
  present: boolean = false;

  defaults() {
    return {
      deadzone: 0.1,
      buttonNames: [
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
  }

  _stickToVector(x: number, y: number) {
    const origin = makePoint(0, 0);
    // Invert y component because gamepad
    // sticks are normal polar coordinate system
    const target = makePoint(x, -y);

    const vector = pointsToVector(origin, target);
    if (Math.abs(vector.magnitude) < this.data.deadzone) {
      vector.magnitude = 0;
    }

    return vector;
  }

  _buttonName(index: number): string {
    return this.data.buttonNames[index] || "unknown button";
  }

  update() {
    const gamepad = navigator.getGamepads()[0];
    if (gamepad == null) {
      this.present = false;
      return;
    }
    this.present = true;

    this.leftStick = this._stickToVector(gamepad.axes[0], gamepad.axes[1]);
    this.rightStick = this._stickToVector(gamepad.axes[2], gamepad.axes[3]);

    gamepad.buttons.forEach((button, index) => {
      const name = this._buttonName(index);
      if (button.pressed) {
        this.pressed.add(name);
      } else {
        this.pressed.delete(name);
      }
    });
  }
}
