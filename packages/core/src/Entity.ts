import {
  Entity as EntityInterface,
  Component as ComponentInterface,
} from "./Interface";
import instantiate from "./instantiate";

export default class Entity implements EntityInterface {
  _kind: "entity" = "entity";

  components: Set<ComponentInterface> = new Set();
  children: Set<Entity> = new Set();
  parent: Entity | null = null;
  name = null;

  static _create(componentFactory: () => any): Entity {
    const ent: Entity = new Entity();

    const component = instantiate(componentFactory, ent);
    ent.components.add(component);

    return ent;
  }

  _componentsByType(): Map<Function | null, ComponentInterface> {
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

  getComponent(
    componentClass: (...args: any[]) => any
  ): null | ComponentInterface {
    const maybeComponent = this._componentsByType().get(componentClass);
    // @ts-ignore
    return maybeComponent ?? null;
  }
}
