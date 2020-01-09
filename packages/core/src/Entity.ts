import {
  Entity as EntityInterface,
  Component as ComponentInterface,
} from "./Interface";
import instantiate from "./instantiate";

function enable(entity: Entity) {
  for (const component of entity.components) {
    if (!component.isEnabled) {
      component.enable();
    }
  }
  for (const child of entity.children) {
    enable(child);
  }
}

function disable(entity: Entity) {
  for (const component of entity.components) {
    if (component.isEnabled) {
      component.disable();
    }
  }
  for (const child of entity.children) {
    disable(child);
  }
}

let id = 0;

export default class Entity implements EntityInterface {
  _kind: "entity" = "entity";

  components: Set<ComponentInterface> = new Set();
  children: Set<Entity> = new Set();
  parent: Entity | null = null;
  name: string | null = null;
  id: number = -1;

  static _create(
    componentFactory: () => any,
    parent?: EntityInterface
  ): Entity {
    const ent: Entity = new Entity();
    ent.id = id;
    id++;

    if (parent) {
      parent.addChild(ent);
    }

    ent.name = componentFactory.name;

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

  getComponent<Func extends (...args: any[]) => any>(
    componentClass: Func
  ):
    | null
    | (ReturnType<Func> extends {}
        ? ReturnType<Func> & ComponentInterface
        : ComponentInterface) {
    const maybeComponent = this._componentsByType().get(componentClass);
    // @ts-ignore
    return maybeComponent ?? null;
  }

  enable() {
    enable(this);
  }

  disable() {
    disable(this);
  }
}
