import BaseComponent from "../Component";

export default class Time extends BaseComponent {
  tick(delta: number) {
    const entities = [];
    if (this.entity) {
      entities.push(this.entity);
      entities.push(...this.entity.children);
    }

    for (const entity of entities) {
      entity.update(delta);
    }
  }
}
