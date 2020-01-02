export interface Entity {
  children: Set<Entity>;
  parent: Entity | null;
  hasChild(child: Entity): boolean;
  addChild(child: Entity): void;
  removeChild(child: Entity): void;
  name?: string | null;

  components: Set<Component>;
  getComponent<API>(
    componentClass: (...args: any[]) => API
  ): null | (API extends {} ? Component & API : Component);
}

export interface Component {
  type: (...args: any[]) => any;
  entity: Entity;
  accumulatedState<T>(key: symbol): Array<T>;
}
