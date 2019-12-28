import { Component, ComponentFunction } from "./Component";
import instantiate from "./instantiate";

export interface Entity {
  children: Set<Entity>;
  parent: Entity | null;
  hasChild(child: Entity): boolean;
  addChild(child: Entity): void;
  removeChild(child: Entity): void;

  components: Set<Component>;
  getComponent<API>(
    componentClass: ComponentFunction<any, API>
  ): null | (API extends {} ? Component & API : Component);
}

export class EntityImplementation implements Entity {
  components: Set<Component> = new Set();
  children: Set<EntityImplementation> = new Set();
  parent: EntityImplementation | null = null;

  static _create<Func extends (...args: any[]) => any>(
    ...args: Parameters<Func>[0] extends void
      ? [Func]
      : [Func, Parameters<Func>[0]]
  ): Entity {
    const [componentFunc, props] = args;

    const ent = new EntityImplementation();

    const component = instantiate(componentFunc, props, ent);
    ent.components.add(component);

    return ent;
  }

  _componentsByType(): Map<Function, Component> {
    return new Map(
      [...this.components].map((component) => [component.type, component])
    );
  }

  hasChild(child: EntityImplementation): boolean {
    return this.children.has(child);
  }
  addChild(child: EntityImplementation): void {
    this.children.add(child);
    child.parent = this;
  }
  removeChild(child: EntityImplementation): void {
    this.children.delete(child);
    child.parent = null;
  }

  getComponent<API>(
    componentClass: ComponentFunction<any, API>
  ): null | (API extends {} ? Component & API : Component) {
    const maybeComponent = this._componentsByType().get(componentClass);
    // @ts-ignore
    return maybeComponent ?? null;
  }
}
