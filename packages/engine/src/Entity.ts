import { ComponentInterface } from "./Component";

type Instantiable = { new (...args: Array<any>): any };

export default class Entity {
  components: Map<Instantiable, ComponentInterface>;
  children: Set<Entity> = new Set();
  parent: Entity | null = null;
  isEnabled: boolean = true;

  constructor(...components: Array<ComponentInterface>) {
    this.components = new Map();
    for (const component of components) {
      this.addComponent(component);
    }
  }

  disable() {
    this.isEnabled = false;

    for (const [, component] of this.components) {
      component.disable();
    }

    for (const entity of this.children) {
      entity.disable();
    }
  }

  enable() {
    this.isEnabled = true;

    for (const [, component] of this.components) {
      component.enable();
    }

    for (const entity of this.children) {
      entity.enable();
    }
  }

  update(delta: number) {
    if (!this.isEnabled) return;

    for (const [, component] of this.components) {
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

    for (const [, component] of this.components) {
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
    component.enable();
  }
  removeComponent(component: ComponentInterface) {
    component.disable();
    // @ts-ignore
    this.components.delete(component.constructor);
    component._receiveEntity(null);
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
