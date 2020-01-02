export interface Entity {
  children: Set<Entity>;
  parent: Entity | null;
  hasChild(child: Entity): boolean;
  addChild(child: Entity): void;
  removeChild(child: Entity): void;
  name?: string | null;

  components: Set<Component>;
  getComponent(componentClass: (...args: any[]) => any): null | Component;
}

export interface Component {
  type: null | ((...args: any[]) => any);
  entity: Entity;
  accumulatedState<T>(key: symbol): Array<T>;
}
