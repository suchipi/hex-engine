import Component from "../Component";

export default class Time extends Component {
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
