import {
  Entity as EntityInterface,
  Component as ComponentInterface,
} from "./Interface";
import instantiate from "./instantiate";
import EntityLifecycle from "./Components/EntityLifecycle";

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

    const entityLifeCycle = child.getComponent(EntityLifecycle);
    if (entityLifeCycle) {
      entityLifeCycle.entityApi.performAddedToParent();
    }
  }
  removeChild(child: Entity): void {
    this.children.delete(child);
    child.parent = null;

    const entityLifeCycle = child.getComponent(EntityLifecycle);
    if (entityLifeCycle) {
      entityLifeCycle.entityApi.performRemovedFromParent();
    }
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
