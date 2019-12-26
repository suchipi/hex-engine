import BaseComponent from "../Component";

export default class Time extends BaseComponent {
  tick(delta: number) {
    const children = this.entity ? this.entity.children : [];

    for (const entity of children) {
      entity.update(delta);
    }
  }
}
