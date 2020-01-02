export interface Entity {
  children: Set<Entity>;
  parent: Entity | null;
  hasChild(child: Entity): boolean;
  addChild(child: Entity): void;
  removeChild(child: Entity): void;
  name?: string | null;

  components: Set<Component>;
  getComponent<Func extends (...args: any[]) => any>(
    componentClass: Func
  ):
    | null
    | (ReturnType<Func> extends {} ? ReturnType<Func> & Component : Component);

  enable(): void;
  disable(): void;
}

export interface Component {
  type: null | ((...args: any[]) => any);
  entity: Entity;
  accumulatedState<T>(key: symbol): Array<T>;
}
