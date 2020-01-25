import {
  Entity as EntityInterface,
  Component as ComponentInterface,
} from "./Interface";
import instantiate from "./instantiate";

export const ON_DESTROY = Symbol("ON_DESTROY");

function destroy(entity: Entity) {
  if (entity.parent) {
    for (const child of entity.children) {
      destroy(child);
    }

    entity.disable();
    const onDestroyState = entity.stateAccumulator<() => void>(ON_DESTROY);
    onDestroyState.all().forEach((callback) => callback());
    entity.parent._removeChild(entity);
  } else {
    throw new Error("Cannot destroy the root entity");
  }
}

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

  // This really should be { [key: symbol]: any },
  // but TypeScript doesn't allow using unique symbols as indexers.
  _accumulatedState: any = {};

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

    ent.name = componentFactory.name || null;

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
    child.disable();
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

  stateAccumulator<T>(
    key: symbol
  ): { add(newValue: T): void; all(): Array<T> } {
    const state = this._accumulatedState;
    if (!state[key]) {
      state[key] = [];
    }

    return {
      add(newValue) {
        state[key].push(newValue);
      },
      all() {
        return state[key];
      },
    };
  }
}
