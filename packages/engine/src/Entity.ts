import Components, {
  ComponentsInstanceMap,
  ComponentName,
  ComponentsDataMap,
} from "./Components";
import HasChildren from "./HasChildren";

type Init = Partial<
  {
    [ComponentName in keyof ComponentsDataMap]:
      | Partial<ComponentsDataMap[ComponentName]>
      | true;
  }
>;

export default class Entity implements HasChildren<Entity> {
  _components: Partial<ComponentsInstanceMap>;
  _children: Set<Entity> = new Set();

  defaults(): Init {
    return {};
  }

  mergeData(existing: Init, incoming: Init): Init {
    return {
      ...existing,
      ...incoming,
    };
  }

  constructor(init: Init = {}) {
    this._components = {};

    const mergedInit = this.mergeData(this.defaults(), init);

    Object.keys(mergedInit).forEach((key) => {
      // @ts-ignore
      const value = mergedInit[key];
      // @ts-ignore
      this._components[key] = new Components[key](
        this,
        value === true ? {} : value
      );
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

  draw({
    canvas,
    context,
  }: {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
  }) {
    Object.keys(this._components).forEach((key) => {
      // @ts-ignore
      const component = this._components[key];
      if (component) {
        component.draw({
          canvas,
          context,
        });
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

  getComponent<Name extends ComponentName>(
    name: Name
  ): ComponentsInstanceMap[Name] | null {
    // @ts-ignore
    return this._components[name] || null;
  }
}
