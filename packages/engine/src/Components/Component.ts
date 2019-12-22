import Entity from "../Entity";
import { ComponentsInstanceMap, ComponentName } from ".";

export default abstract class Component<Data extends {}> {
  entity: Entity;
  data: Data;

  constructor(entity: Entity, data?: Partial<Data>) {
    this.entity = entity;
    this.data = this.mergeData(this.defaults(), data || {});
  }

  mergeData(existing: Data, incoming: Partial<Data>): Data {
    return {
      ...existing,
      ...incoming,
    };
  }

  abstract defaults(): Data;

  update(_delta: number): void {}

  draw(_config: {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
  }): void {}

  getComponent<Name extends ComponentName>(
    name: Name
  ): ComponentsInstanceMap[Name] | null {
    return this.entity.getComponent(name);
  }
}
