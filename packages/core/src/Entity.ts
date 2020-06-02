import {
  Entity as EntityInterface,
  Component as ComponentInterface,
} from "./Interface";
import instantiate from "./instantiate";
import { StorageForUseDestroy } from "./Hooks/useDestroy";

function enable(entity: EntityInterface) {
  for (const component of entity.components) {
    if (!component.isEnabled) {
      component.enable();
    }
  }
  for (const child of entity.children) {
    enable(child);
  }
}

function disable(entity: EntityInterface) {
  for (const component of entity.components) {
    if (component.isEnabled) {
      component.disable();
    }
  }
  for (const child of entity.children) {
    disable(child);
  }
}

function gatherDescendants(ent: EntityInterface, descendants: Array<EntityInterface> = []) {
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
  children: Set<EntityInterface> = new Set();
  name: string | null = null;
  id: number = -1;
  rootComponent: any;

  _isDestroying: boolean = false;

  static _create<T>(
    componentFactory: () => T,
    parent?: Entity
  ): Entity & {
    rootComponent: T extends {} ? ComponentInterface & T : ComponentInterface;
  } {
    const ent: Entity = new Entity();
    ent.id = id;
    id++;

    ent.parent = parent || null;

    const component = instantiate(componentFactory, ent);
    ent.rootComponent = component;
    ent.components.add(component);

    return ent;
  }

  _componentsByType(): Map<Function | null, ComponentInterface> {
    return new Map(
      [...this.components].map((component) => [component.type, component])
    );
  }

  _parent: EntityInterface | null = null;
  get parent(): EntityInterface | null {
    return this._parent;
  }
  set parent(newParent: EntityInterface | null) {
    if (this.parent === newParent) return;
    this.parent?.children.delete(this);
    this._parent = newParent;
    newParent?.children.add(this);
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

  enable() {
    enable(this);
  }

  disable() {
    disable(this);
  }

  destroy() {
    if (this._isDestroying) return;
    this._isDestroying = true;

    for (const child of this.children) {
      child.destroy();
    }

    this.disable();

    const storageForUseDestroy = this.getComponent(StorageForUseDestroy);
    if (storageForUseDestroy) {
      storageForUseDestroy.callbacks.forEach((callback) => callback());
    }

    this.parent = null;

    this._isDestroying = false;
  }

  descendants() {
    return gatherDescendants(this);
  }

  ancestors() {
    const ancestors: Array<EntityInterface> = [];

    let currentEnt = this.parent;
    while (currentEnt) {
      ancestors.unshift(currentEnt);
      currentEnt = currentEnt.parent;
    }

    return ancestors;
  }

}
