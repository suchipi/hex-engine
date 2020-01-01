export type ComponentFunction<Props, API> = (props: Props) => API;

export interface Entity {
  _kind: "entity";

  children: Set<Entity>;
  parent: Entity | null;
  hasChild(child: Entity): boolean;
  addChild(child: Entity): void;
  removeChild(child: Entity): void;
  name?: string | null;

  components: Set<Component>;
  getComponent<API>(
    componentClass: ComponentFunction<any, API>
  ): null | (API extends {} ? Component & API : Component);
}

export interface Component {
  _kind: "component";

  type: ComponentFunction<any, any>;
  entity: Entity;
  accumulatedState<T>(key: symbol): Array<T>;
}
