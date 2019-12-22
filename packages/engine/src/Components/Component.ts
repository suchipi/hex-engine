import Entity from "../Entity";

export default abstract class Component<Data extends {}> {
  entity: Entity;
  data: Data;

  mergeData(existing: Data, incoming: Partial<Data>): Data {
    return {
      ...existing,
      ...incoming,
    };
  }

  abstract defaults(): Data;

  constructor(entity: Entity, data?: Partial<Data>) {
    this.entity = entity;
    this.data = this.mergeData(this.defaults(), data || {});
  }

  // @ts-ignore warning unused var
  update(delta: number): void {}

  // @ts-ignore warning unused var
  draw(element: HTMLCanvasElement): void {}
}
