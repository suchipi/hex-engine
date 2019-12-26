import Entity from "../Entity";

type Instantiable = { new (...args: Array<any>): any };

export interface ComponentInterface {
  entity: Entity | null;
  isEnabled: boolean;

  _receiveEntity(entity: Entity): void;

  enable(): void;
  disable(): void;

  onEnabled(): void;
  onDisabled(): void;

  update(delta: number): void;

  draw(config: {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
  }): void;

  getComponent<SomeClass extends Instantiable>(
    componentClass: SomeClass
  ): InstanceType<SomeClass> | null;
}

export type ComponentConfig = {
  isEnabled: boolean;
};

export default class Component implements ComponentInterface {
  entity: Entity | null = null;
  isEnabled: boolean;

  constructor(config: Partial<ComponentConfig> = {}) {
    this.isEnabled = config.isEnabled ?? true;
  }

  _receiveEntity(entity: Entity) {
    this.entity = entity;
  }

  enable() {
    this.isEnabled = true;
    this.onEnabled();
  }

  disable() {
    this.isEnabled = false;
    this.onDisabled();
  }

  onEnabled(): void {}

  update(_delta: number): void {}

  draw(_config: {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
  }): void {}

  onDisabled(): void {}

  getComponent<SomeClass extends Instantiable>(
    componentClass: SomeClass
  ): InstanceType<SomeClass> | null {
    if (this.entity == null) return null;
    return this.entity.getComponent(componentClass);
  }
}
