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

  static _create(
    componentFunc: (...args: any[]) => any,
    componentFactory: () => any
  ): EntityInterface {
    const ent = new Entity();

    const component = instantiate(componentFunc, componentFactory, ent);
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
    componentClass: (...args: any[]) => API
  ): null | (API extends {} ? ComponentInterface & API : ComponentInterface) {
    const maybeComponent = this._componentsByType().get(componentClass);
    // @ts-ignore
    return maybeComponent ?? null;
  }
}
