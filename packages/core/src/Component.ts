import Entity from "./Entity";
import HooksSystem from "./HooksSystem";

export type ComponentFunction<Props, API> = (props: Props) => API;

export interface ComponentInterface {
  type: ComponentFunction<any, any>;
  entity: Entity;

  isEnabled: boolean;
  enable(): void;
  disable(): void;
  onEnabled(): void;
  onDisabled(): void;

  update(delta: number): void;

  draw(config: {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
  }): void;

  getComponent<API>(
    componentFunction: ComponentFunction<any, API>
  ): null | (API extends {} ? ComponentInterface & API : ComponentInterface);
}

export type ComponentConfig = {
  isEnabled: boolean;
};

export default class Component implements ComponentInterface {
  type: ComponentFunction<any, any>;
  entity: Entity;
  isEnabled: boolean = true;

  isClassComponent: boolean = true;

  constructor(type: ComponentFunction<any, any>, entity: Entity) {
    this.type = type;
    this.entity = entity;
  }

  enable() {
    this.isEnabled = true;
    HooksSystem.withInstance(this, () => {
      this.onEnabled();
    });
  }

  disable() {
    this.isEnabled = false;
    HooksSystem.withInstance(this, () => {
      this.onDisabled();
    });
  }
  onEnabled(): void {}

  update(_delta: number): void {}

  draw(_config: {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
  }): void {}

  onDisabled(): void {}

  getComponent<API>(
    componentFunction: ComponentFunction<any, API>
  ): null | (API extends {} ? ComponentInterface & API : ComponentInterface) {
    if (this.entity == null) return null;
    return this.entity.getComponent(componentFunction);
  }
}
