import mitt from "mitt";
import Element, { ComponentFunction } from "./Element";
import { ComponentInterface } from "./Component";
import HooksSystem, { instantiate } from "./HooksSystem";

export default class Entity implements mitt.Emitter {
  components: Set<ComponentInterface>;
  children: Set<Entity> = new Set();
  parent: Entity | null = null;
  isEnabled: boolean;

  // TODO: should really get rid of this emitter situation, maybe move it to a component
  _emitter: mitt.Emitter = mitt();

  constructor(elements: Array<Element<any, any>>) {
    this.components = new Set();
    this.isEnabled = false;
    for (const element of elements) {
      const component = instantiate(element);
      this.addComponent(component);
    }
    this.enable();
  }

  on(type: string, handler: (...args: any) => any): void {
    this._emitter.on(type, handler);
  }

  off(type: string, handler: (...args: any) => any): void {
    this._emitter.off(type, handler);
  }

  emit(type: string, event?: any): void {
    this._emitter.emit(type, event);
  }

  _componentsByType(): Map<Function, ComponentInterface> {
    return new Map(
      [...this.components].map((component) => [
        component.constructor,
        component,
      ])
    );
  }

  disable() {
    this.isEnabled = false;

    for (const component of this.components) {
      component.disable();
    }

    for (const entity of this.children) {
      entity.disable();
    }
  }

  enable() {
    this.isEnabled = true;

    for (const component of this.components) {
      HooksSystem.withInstance(component, () => {
        component.enable();
      });
    }

    for (const entity of this.children) {
      entity.enable();
    }
  }

  update(delta: number) {
    if (!this.isEnabled) return;

    for (const component of this.components) {
      if (component.isEnabled) {
        HooksSystem.withInstance(component, () => {
          component.update(delta);
        });
      }
    }

    for (const entity of this.children) {
      if (entity.isEnabled) {
        entity.update(delta);
      }
    }
  }

  draw({
    canvas,
    context,
  }: {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
  }) {
    if (!this.isEnabled) return;

    for (const component of this.components) {
      if (component.isEnabled) {
        HooksSystem.withInstance(component, () => {
          component.draw({
            canvas,
            context,
          });
        });
      }
    }

    for (const entity of this.children) {
      if (entity.isEnabled) {
        entity.draw({
          canvas,
          context,
        });
      }
    }
  }

  hasChild(child: Entity): boolean {
    return this.children.has(child);
  }
  addChild(child: Entity): void {
    this.children.add(child);
    child.parent = this;
  }
  removeChild(child: Entity): void {
    this.children.delete(child);
    child.parent = null;
  }

  addComponent(component: ComponentInterface) {
    component._receiveEntity(this);
    // @ts-ignore
    this.components.add(component);
    if (this.isEnabled && component.isEnabled) {
      component.enable();
    }
  }

  removeComponent(
    componentOrComponentType: ComponentInterface | ComponentFunction<any, any>
  ) {
    let component: ComponentInterface | null;

    if (typeof componentOrComponentType === "function") {
      component = this.getComponent(componentOrComponentType);
    } else {
      component = componentOrComponentType;
    }

    if (!component) return;

    component.disable();
    this.components.delete(component);
    component._receiveEntity(null);
  }

  hasComponent(
    componentOrComponentType: ComponentInterface | ComponentFunction<any, any>
  ) {
    if (typeof componentOrComponentType === "function") {
      return new Set(this._componentsByType().keys()).has(
        componentOrComponentType
      );
    } else {
      return this.components.has(componentOrComponentType);
    }
  }

  getComponent<Props extends {}, API extends {}>(
    componentClass: ComponentFunction<Props, API>
  ): (ComponentInterface & API) | null {
    const maybeComponent = this._componentsByType().get(componentClass);
    // @ts-ignore
    return maybeComponent ?? null;
  }

  findRootUpwards(): Entity {
    let ent: Entity = this;
    while (ent.parent) {
      ent = ent.parent;
    }
    return ent;
  }
}
