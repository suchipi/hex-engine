import mitt from "mitt";
import { ComponentInterface } from "./Component";
import HooksSystem, { instantiate } from "./HooksSystem";

type Instantiable = { new (...args: Array<any>): any };

export default class Entity implements mitt.Emitter {
  components: Set<ComponentInterface>;
  children: Set<Entity> = new Set();
  parent: Entity | null = null;
  isEnabled: boolean;
  _emitter: mitt.Emitter = mitt();

  constructor(...components: Array<ComponentInterface | Function>) {
    this.components = new Set();
    this.isEnabled = false;
    for (const component of components) {
      if (typeof component === "function") {
        // @ts-ignore
        const instantiatedComponent = instantiate(component);
        this.addComponent(instantiatedComponent);
      } else {
        this.addComponent(component);
      }
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

  _componentsByClass(): Map<Function, ComponentInterface> {
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

  removeComponent(componentOrComponentClass: ComponentInterface | Function) {
    let component: ComponentInterface;

    if (typeof componentOrComponentClass === "function") {
      component = this.getComponent(componentOrComponentClass);
    } else {
      component = componentOrComponentClass;
    }

    if (!component) return;

    component.disable();
    this.components.delete(component);
    component._receiveEntity(null);
  }

  hasComponent(componentOrComponentClass: ComponentInterface | Function) {
    if (typeof componentOrComponentClass === "function") {
      return new Set(this._componentsByClass().keys()).has(
        componentOrComponentClass
      );
    } else {
      return this.components.has(componentOrComponentClass);
    }
  }

  getComponent<SomeClass extends Function>(
    componentClass: SomeClass
  ):
    | (SomeClass extends Instantiable
        ? InstanceType<SomeClass>
        : ReturnType<
            // @ts-ignore
            SomeClass
          >)
    | null {
    const maybeComponent = this._componentsByClass().get(componentClass);
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
