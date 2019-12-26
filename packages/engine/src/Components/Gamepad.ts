import Component, { ComponentConfig } from "./Component";
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

function getDefaults() {
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

export default class Gamepad extends Component {
  leftStick: Vector = makeVector(makeAngle(0), 0);
  rightStick: Vector = makeVector(makeAngle(0), 0);
  pressed: Set<string> = new Set();
  present: boolean = false;
  deadzone: number;
  buttonNames: Array<string>;

  constructor(data: Partial<Data & ComponentConfig>) {
    super(data);
    const defaults = getDefaults();
    this.deadzone = data.deadzone ?? defaults.deadzone;
    this.buttonNames = data.buttonNames ?? defaults.buttonNames;
  }

  private _stickToVector(x: number, y: number) {
    const origin = makePoint(0, 0);
    // Invert y component because gamepad
    // sticks are normal polar coordinate system
    const target = makePoint(x, -y);

    const vector = pointsToVector(origin, target);
    if (Math.abs(vector.magnitude) < this.deadzone) {
      vector.magnitude = 0;
    }

    return vector;
  }

  private _buttonName(index: number): string {
    return this.buttonNames[index] || "unknown button";
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
