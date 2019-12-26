import Component from "./Component";
import { Vector, makeVector, makeAngle } from "../Models";

export default class Keyboard extends Component {
  pressed: Set<string> = new Set();

  onEnabled() {
    this._bindListeners();
  }

  onDisabled() {
    this._unbindListeners();
  }

  private _bindListeners() {
    document.addEventListener("keydown", this._processKeydown);
    document.addEventListener("keyup", this._processKeyup);
  }

  private _unbindListeners() {
    document.removeEventListener("keydown", this._processKeydown);
    document.removeEventListener("keyup", this._processKeyup);
  }

  private _processKeydown = (event: KeyboardEvent) => {
    if (event.repeat) {
      return;
    }
    this.pressed.add(event.key);
  };

  private _processKeyup = (event: KeyboardEvent) => {
    if (event.repeat) {
      return;
    }
    this.pressed.delete(event.key);
  };

  vectorFromKeys(
    upKey: string,
    downKey: string,
    leftKey: string,
    rightKey: string
  ): Vector {
    const pressedKeys = this.pressed;
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

    return makeVector(makeAngle(angle), magnitude);
  }
}
