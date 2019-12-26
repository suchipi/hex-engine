import { ComponentInterface } from "./Components";
import HasChildren from "./HasChildren";

type Instantiable = { new (...args: Array<any>): any };

export default class Entity implements HasChildren<Entity> {
  _components: Map<Instantiable, ComponentInterface>;
  _children: Set<Entity> = new Set();

  constructor(...components: Array<ComponentInterface>) {
    this._components = new Map();
    for (const component of components) {
      this.addComponent(component);
    }
  }

  update(delta: number) {
    for (const [, component] of this._components) {
      component.update(delta);
    }
  }

  draw({
    canvas,
    context,
  }: {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
  }) {
    for (const [, component] of this._components) {
      component.draw({
        canvas,
        context,
      });
    }
  }

  hasChild(child: Entity): boolean {
    return this._children.has(child);
  }
  addChild(child: Entity): void {
    this._children.add(child);
  }
  removeChild(child: Entity): void {
    this._children.delete(child);
  }

  addComponent(component: ComponentInterface) {
    // @ts-ignore
    this._components.set(component.constructor, component);
    component._receiveEntity(this);
    component.enable();
  }

  getComponent<SomeClass extends Instantiable>(
    componentClass: SomeClass
  ): InstanceType<SomeClass> | null {
    const maybeComponent = this._components.get(componentClass);
    // @ts-ignore
    return maybeComponent ?? null;
  }
}
