import {
  Entity as EntityInterface,
  Component as ComponentInterface,
} from "./Interface";
import instantiate from "./instantiate";
import { StorageForUseDestroy } from "./Hooks/useDestroy";

function destroy(entity: Entity) {
  if (entity._isDestroying) return;
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
    entity.parent._removeChild(entity);
  }

  entity._isDestroying = false;
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

  _isEnabled: boolean = false;
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

    if (parent) {
      parent._addChild(ent);
    }

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

  _addChild(child: Entity): void {
    this.children.add(child);
    child.parent = this;
  }
  _removeChild(child: Entity): void {
    this.children.delete(child);
    child.parent = null;
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

  get isEnabled(): boolean {
    return this._isEnabled;
  }
  set isEnabled(nextVal: boolean) {
    //if (this.isEnabled === nextVal) return;

    for (const component of this.components) {
      component.isEnabled = nextVal;
    }

    for (const child of this.children) {
      child.isEnabled = nextVal;
    }
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
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

  takeChild(entity: Entity) {
    entity.parent?._removeChild(entity);
    this._addChild(entity);
  }
}
