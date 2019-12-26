import { ComponentInterface } from "./Component";

type Instantiable = { new (...args: Array<any>): any };

export default class Entity {
  components: Map<Instantiable, ComponentInterface>;
  children: Set<Entity> = new Set();
  parent: Entity | null = null;
  isEnabled: boolean;

  constructor(...components: Array<ComponentInterface>) {
    this.components = new Map();
    this.isEnabled = false;
    for (const component of components) {
      this.addComponent(component);
    }
    this.enable();
  }

  disable() {
    this.isEnabled = false;

    for (const component of this.components.values()) {
      component.disable();
    }

    for (const entity of this.children) {
      entity.disable();
    }
  }

  enable() {
    this.isEnabled = true;

    for (const component of this.components.values()) {
      component.enable();
    }

    for (const entity of this.children) {
      entity.enable();
    }
  }

  update(delta: number) {
    if (!this.isEnabled) return;

    for (const component of this.components.values()) {
      component.update(delta);
    }

    for (const entity of this.children) {
      entity.update(delta);
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

    for (const component of this.components.values()) {
      component.draw({
        canvas,
        context,
      });
    }

    for (const entity of this.children) {
      entity.draw({
        canvas,
        context,
      });
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
    this.components.set(component.constructor, component);
    if (this.isEnabled && component.isEnabled) {
      component.enable();
    }
  }

  removeComponent(
    componentOrComponentClass:
      | ComponentInterface
      | { new (...args: any[]): ComponentInterface }
  ) {
    let component: ComponentInterface;
    if ({}.hasOwnProperty.call(componentOrComponentClass, "entity")) {
      component = componentOrComponentClass as ComponentInterface;
    } else {
      // @ts-ignore
      component = this.getComponent(componentOrComponentClass);
    }
    if (!component) return;

    component.disable();
    // @ts-ignore
    this.components.delete(component.constructor);
    component._receiveEntity(null);
  }

  hasComponent(
    componentOrComponentClass:
      | ComponentInterface
      | { new (...args: any[]): ComponentInterface }
  ) {
    return (
      // @ts-ignore
      this.components.has(componentOrComponentClass) ||
      // @ts-ignore
      new Set(this.components.values()).has(componentOrComponentClass)
    );
  }

  getComponent<SomeClass extends Instantiable>(
    componentClass: SomeClass
  ): InstanceType<SomeClass> | null {
    const maybeComponent = this.components.get(componentClass);
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
