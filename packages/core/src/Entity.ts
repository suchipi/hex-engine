import {
  Entity as EntityInterface,
  Component as ComponentInterface,
  ComponentFunction,
} from "./Interface";
import instantiate from "./instantiate";

export default class Entity implements EntityInterface {
  _kind: "entity" = "entity";

  components: Set<ComponentInterface> = new Set();
  children: Set<Entity> = new Set();
  parent: Entity | null = null;
  name = null;

  static _create<Func extends (...args: any[]) => any>(
    ...args: Parameters<Func>[0] extends void
      ? [Func]
      : [Func, Parameters<Func>[0]]
  ): EntityInterface {
    const [componentFunc, props] = args;

    const ent = new Entity();

    const component = instantiate(componentFunc, props, ent);
    ent.components.add(component);

    return ent;
  }

  _componentsByType(): Map<Function, ComponentInterface> {
    return new Map(
      [...this.components].map((component) => [component.type, component])
    );
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

  getComponent<API>(
    componentClass: ComponentFunction<any, API>
  ): null | (API extends {} ? ComponentInterface & API : ComponentInterface) {
    const maybeComponent = this._componentsByType().get(componentClass);
    // @ts-ignore
    return maybeComponent ?? null;
  }
}
