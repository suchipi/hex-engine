import Components from "./Components";
import HasChildren from "./HasChildren";

type ComponentsClassMap = typeof Components;

type InitType = Partial<
  {
    [ComponentName in keyof ComponentsClassMap]: ReturnType<
      InstanceType<ComponentsClassMap[ComponentName]>["defaults"]
    >;
  }
>;

type ComponentsInstanceMap = {
  [ComponentName in keyof ComponentsClassMap]: InstanceType<
    ComponentsClassMap[ComponentName]
  >;
};

export default class Entity implements HasChildren<Entity> {
  _components: Partial<ComponentsInstanceMap>;
  _children: Set<Entity> = new Set();

  constructor(init: InitType = {}) {
    this._components = {};

    Object.keys(init).forEach((key) => {
      // @ts-ignore
      const value = init[key];
      // @ts-ignore
      this._components[key] = new Components[key](value);
    });
  }

  update(delta: number) {
    Object.keys(this._components).forEach((key) => {
      // @ts-ignore
      const component = this._components[key];
      if (component) {
        component.update(delta);
      }
    });
  }

  draw(element: HTMLCanvasElement) {
    Object.keys(this._components).forEach((key) => {
      // @ts-ignore
      const component = this._components[key];
      if (component) {
        component.draw(element);
      }
    });
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
}
