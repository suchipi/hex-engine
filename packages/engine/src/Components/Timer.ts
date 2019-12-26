import BaseComponent from "../Component";

export default class Timer extends BaseComponent {
  target: number = 0;

  set(msFromNow: number) {
    this.target = -msFromNow;
  }

  delta() {
    return this.target;
  }

  update(delta: number) {
    this.target += delta;
  }
}
