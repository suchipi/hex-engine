import {
  Entity as EntityInterface,
  Component as ComponentInterface,
} from "./Interface";
import instantiate from "./instantiate";
import { StorageForUseDestroy } from "./Hooks/useDestroy";
import {
  CoreEventPhase,
  CoreEventType,
  eventSystemSingleton,
} from "./EventSystem";

function destroy(entity: Entity) {
  if (entity._isDestroying) return;

  eventSystemSingleton.emit({
    eventType: CoreEventType.ENTITY_DESTROY,
    eventPhase: CoreEventPhase.BEFORE,
    entity,
  });

  entity._isDestroying = true;

  for (const child of entity.children) {
    destroy(child);
  }

  entity.disable();

  const storageForUseDestroy = entity.getComponent(StorageForUseDestroy);
  if (storageForUseDestroy) {
    storageForUseDestroy.callbacks.forEach((callback) => callback());
  }

  if (entity.parent) {
    entity.parent.removeChild(entity);
  }

  entity._isDestroying = false;
  entity._isDestroyed = true;

  eventSystemSingleton.emit({
    eventType: CoreEventType.ENTITY_DESTROY,
    eventPhase: CoreEventPhase.AFTER,
    entity,
  });
}

function enable(entity: Entity) {
  eventSystemSingleton.emit({
    eventType: CoreEventType.ENTITY_ENABLE,
    eventPhase: CoreEventPhase.BEFORE,
    entity,
  });

  for (const component of entity.components) {
    if (!component.isEnabled) {
      component.enable();
    }
  }
  for (const child of entity.children) {
    enable(child);
  }

  eventSystemSingleton.emit({
    eventType: CoreEventType.ENTITY_ENABLE,
    eventPhase: CoreEventPhase.AFTER,
    entity,
  });
}

function disable(entity: Entity) {
  eventSystemSingleton.emit({
    eventType: CoreEventType.ENTITY_DISABLE,
    eventPhase: CoreEventPhase.BEFORE,
    entity,
  });

  for (const component of entity.components) {
    if (component.isEnabled) {
      component.disable();
    }
  }
  for (const child of entity.children) {
    disable(child);
  }

  eventSystemSingleton.emit({
    eventType: CoreEventType.ENTITY_DISABLE,
    eventPhase: CoreEventPhase.AFTER,
    entity,
  });
}

function gatherDescendants(ent: Entity, descendants: Array<Entity> = []) {
  for (const child of ent.children) {
    descendants.push(child);
  }
  for (const child of ent.children) {
    gatherDescendants(child, descendants);
  }
  return descendants;
}

let id = 0;

export default class Entity implements EntityInterface {
  _kind: "entity" = "entity";

  components: Set<ComponentInterface> = new Set();
  children: Set<Entity> = new Set();
  parent: Entity | null = null;
  name: string | null = null;
  id: number = -1;
  rootComponent: any;

  _isDestroying: boolean = false;
  _isDestroyed: boolean = false;

  static _create<T>(
    componentFactory: () => T,
    parent?: Entity
  ): Entity & {
    rootComponent: T extends {} ? ComponentInterface & T : ComponentInterface;
  } {
    eventSystemSingleton.emit({
      eventType: CoreEventType.ENTITY_CREATE,
      eventPhase: CoreEventPhase.BEFORE,
      componentFactory,
      parent: parent ?? null,
    });

    const ent: Entity = new Entity();
    ent.id = id;
    id++;

    if (parent) {
      parent.addChild(ent);
    }

    const component = instantiate(componentFactory, ent);
    ent.rootComponent = component;
    ent.components.add(component);

    eventSystemSingleton.emit({
      eventType: CoreEventType.ENTITY_CREATE,
      eventPhase: CoreEventPhase.AFTER,
      componentFactory,
      parent: parent ?? null,
      entity: ent,
    });

    return ent;
  }

  _componentsByType(): Map<Function | null, ComponentInterface> {
    return new Map(
      [...this.components].map((component) => [component.type, component])
    );
  }

  getComponent<Func extends (...args: any[]) => any>(
    componentType: Func
  ):
    | null
    | (ReturnType<Func> extends {}
        ? ReturnType<Func> & ComponentInterface
        : ComponentInterface) {
    const maybeComponent = this._componentsByType().get(componentType);
    // @ts-ignore
    return maybeComponent ?? null;
  }

  hasComponent<Func extends (...args: any[]) => any>(
    componentType: Func
  ): boolean {
    const maybeComponent = this._componentsByType().get(componentType);
    return Boolean(maybeComponent);
  }

  addComponent<T>(
    componentFactory: () => T
  ): T extends {} ? T & ComponentInterface : ComponentInterface {
    const component = instantiate(componentFactory, this);

    eventSystemSingleton.emit({
      eventType: CoreEventType.ENTITY_ADD_COMPONENT,
      eventPhase: CoreEventPhase.BEFORE,
      componentFactory,
      entity: this,
      component,
    });

    this.components.add(component);

    eventSystemSingleton.emit({
      eventType: CoreEventType.ENTITY_ADD_COMPONENT,
      eventPhase: CoreEventPhase.AFTER,
      componentFactory,
      entity: this,
      component,
    });

    return component;
  }

  removeComponent(componentInstance: ComponentInterface): void {
    if (!this.components.has(componentInstance)) return;

    eventSystemSingleton.emit({
      eventType: CoreEventType.ENTITY_REMOVE_COMPONENT,
      eventPhase: CoreEventPhase.BEFORE,
      component: componentInstance,
      entity: this,
    });

    componentInstance.disable();
    this.components.delete(componentInstance);

    eventSystemSingleton.emit({
      eventType: CoreEventType.ENTITY_REMOVE_COMPONENT,
      eventPhase: CoreEventPhase.AFTER,
      component: componentInstance,
      entity: this,
    });
  }

  enable() {
    enable(this);
  }

  disable() {
    disable(this);
  }

  destroy() {
    destroy(this);
  }

  descendants() {
    return gatherDescendants(this);
  }

  ancestors() {
    const ancestors: Array<Entity> = [];

    let currentEnt = this.parent;
    while (currentEnt) {
      ancestors.unshift(currentEnt);
      currentEnt = currentEnt.parent;
    }

    return ancestors;
  }

  createChild<T>(componentFactory: () => T): Entity & {
    rootComponent: T extends {} ? ComponentInterface & T : ComponentInterface;
  } {
    const child = Entity._create(componentFactory, this);
    return child;
  }

  addChild(child: Entity): void {
    if (child.parent !== null) {
      throw new Error(
        "The child passed into addChild already had a parent. Either remove it from its parent before calling addChild, or call takeChild instead."
      );
    }

    eventSystemSingleton.emit({
      eventType: CoreEventType.ENTITY_ADD_CHILD,
      eventPhase: CoreEventPhase.BEFORE,
      parent: this,
      child: child,
    });

    this.children.add(child);
    child.parent = this;

    eventSystemSingleton.emit({
      eventType: CoreEventType.ENTITY_ADD_CHILD,
      eventPhase: CoreEventPhase.AFTER,
      parent: this,
      child: child,
    });
  }

  removeChild(child: Entity): void {
    if (child.parent !== this) {
      throw new Error(
        "Attempted to remove a child from this Entity, but this Entity wasn't the child's parent."
      );
    }

    eventSystemSingleton.emit({
      eventType: CoreEventType.ENTITY_REMOVE_CHILD,
      eventPhase: CoreEventPhase.BEFORE,
      parent: this,
      child: child,
    });

    this.children.delete(child);
    child.parent = null;

    eventSystemSingleton.emit({
      eventType: CoreEventType.ENTITY_REMOVE_CHILD,
      eventPhase: CoreEventPhase.AFTER,
      parent: this,
      child: child,
    });

    if (process.env.NODE_ENV !== "production") {
      setTimeout(() => {
        if (!child._isDestroyed) {
          console.warn(
            "A child was removed from its parent, but wasn't destroyed within 1 second. This can cause memory leaks.\nWhen removing a child entity, either destroy it or give it a new parent.\nThis message will not be logged in production.\n",
            child
          );
        }
      }, 1000);
    }
  }

  takeChild(entity: Entity) {
    entity.parent?.removeChild(entity);
    this.addChild(entity);
  }
}
