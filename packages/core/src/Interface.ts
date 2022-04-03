/**
 * A Hex Engine Entity. The most common way to make one of these is via `useChild`,
 * but you also get one returned by `createRoot`. You can get the Entity for the current
 * component by using `useEntity`.
 */
export interface Entity {
  /**
   * A name that will be shown in the inspector, for debugging purposes.
   * You can set this using `useEntityName`. If you don't set one, we will
   * try to infer one, based on the name of the root component.
   */
  name?: string | null;

  /**
   * A unique id for this Entity. These start at zero and go up one at a time
   * whenever you create an entity.
   */
  id: number;

  /**
   * This Entity's children entities. These get here from components on
   * this Entity calling `useChild`.
   */
  children: Set<Entity>;

  /**
   * The parent Entity for this Entity, or null if there isn't one.
   * Generally, this will only ever be null if it's the root Entity.
   */
  parent: Entity | null;

  /**
   * Search this Entity's children recursively for their children,
   * and return an Array containing every Entity that is a descendant
   * of this one.
   */
  descendants(): Array<Entity>;

  /**
   * Find this Entity's parent, then this Entity's parent's parent, and so on,
   * until there aren't any parents left. Then return the list as an Array.
   *
   * The Array will be ordered such that the earliest ancestor (often the root
   * entity) is first in the Array, and the most-recent ancestor (this Entity's
   * parent) will be last in the Array.
   */
  ancestors(): Array<Entity>;

  /**
   * Constructs a new Entity using the provided component factory,
   * then adds it to this Entity.
   *
   * This is the same as `useChild`, but instead of being bound to the current
   * Entity, it adds it to the Entity you call `createChild` on.
   *
   * @param componentFactory The function that calls the Component, same as you would pass into `useChild`.
   */
  createChild<T>(
    componentFactory: () => T
  ): Entity & {
    rootComponent: T extends {} ? Component & T : Component;
  };

  /**
   * Adds a child Entity to this Entity.
   * @param child The child Entity to add.
   */
  addChild(child: Entity): void;

  /**
   * Removes a child Entity from this Entity.
   * @param child The child Entity to remove.
   */
  removeChild(child: Entity): void;

  /**
   * Transfers the ownership of the Entity from its parent to this Entity.
   */
  takeChild(entity: Entity): void;

  /**
   * All the Component instances that are on this Entity.
   */
  components: Set<Component>;

  /**
   * Searches the entity for a Component with this type, and returns the
   * first one found. If none are found, it returns null.
   *
   * Note that in order to be found by this function, the component *must*
   * have registered its type using `useType`.
   * @param componentType
   */
  getComponent<Func extends (...args: any[]) => any>(
    componentType: Func
  ):
    | null
    | (ReturnType<Func> extends {} ? ReturnType<Func> & Component : Component);

  /**
   * Searches the entity for a Component with this type, and returns true if one is found.
   *
   * Note that in order to be found by this function, the component *must*
   * have registered its type using `useType`.
   * @param componentType
   */
  hasComponent<Func extends (...args: any[]) => any>(
    componentType: Func
  ): boolean;

  /**
   * Creates a new component on the entity. Returns the component instance for the created component.
   *
   * This behaves the same as `useNewComponent`, but can be used to add a Component later in an Entity's lifecycle.
   *
   * @param componentFactory
   */
  addComponent<T>(
    componentFactory: () => T
  ): T extends {} ? T & Component : Component;

  /**
   * Removes a component instance from the entity. The component will be
   * disabled prior to being removed. To define what should happen when your
   * Component is disabled, use `useEnableDisable`.
   *
   * @param componentInstance
   */
  removeComponent(componentInstance: Component): void;

  /**
   * Enable all components on this Entity and its children
   */
  enable(): void;

  /**
   * Disable all components on this Entity and its children
   */
  disable(): void;

  /**
   * Destroy this entity and remove it from the tree.
   *
   * This runs all onDestroy callbacks registered via useDestroy,
   * on this Entity and all of its children.
   *
   * Additionally, all entities are disabled prior to being destroyed.
   */
  destroy(): void;
}

/**
 * A Hex Engine Component instance. These hold the state for the Components
 * that the Entity is made up of, and there is one Component instance per
 * Component function that your Entity uses.
 *
 * They are returned when you run `useNewComponent`, or call `getComponent`
 * on an `Entity`. They can also be found in an `Entity`'s `components` Set.
 */
export interface Component {
  /**
   * The Component function that this Component instance cooresponds to.
   * This gets set when you call `useType`, and it *must* be set in order
   * for this Component instance to be returned from `Entity.getComponent`.
   */
  type: null | ((...args: any[]) => any);

  /**
   * The Entity this Component belongs to. Inside of a Component function,
   * you can call `useEntity` to get this.
   */
  entity: Entity;

  /**
   * Whether this Component is currently "enabled". To define what should
   * happen when your Component is enabled or disabled, use `useEnableDisable`.
   */
  isEnabled: boolean;

  /**
   * Enable this Component. To define what should happen when your Component
   * is enabled or disabled, use `useEnableDisable`.
   */
  enable(): void;

  /**
   * Disable this Component. To define what should happen when your Component
   * is enabled or disabled, use `useEnableDisable`.
   */
  disable(): void;
}
