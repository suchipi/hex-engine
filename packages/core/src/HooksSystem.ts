import { makeHooksSystem } from "concubine";
import Entity from "./Entity";
import {
  Component as ComponentInterface,
  Entity as EntityInterface,
} from "./Interface";
import instantiate from "./instantiate";

/**
 * The hooks system used by Hex Engine to associate hook functions
 * with the current Component instance.
 */
const HooksSystem = makeHooksSystem<ComponentInterface>()({
  useNewComponent: (instance) =>
    /**
     * Create a new Component and add it to the current Component's Entity.
     * @param componentFunction The function that creates the new Component.
     * @returns The new Component instance.
     */
    <T>(componentFunction: () => T): T & ComponentInterface => {
      const child = instantiate(componentFunction, instance.entity);
      instance.entity.components.add(child);

      // @ts-ignore
      return child;
    },

  useType: (instance) =>
    /**
     * Set the `type` of the current Component instance. This is *required*
     * for Component functions if you want to be able to find them using
     * `Entity.getComponent()`. When in doubt, always set this- there's no
     * reason not to.
     */
    (type: (...args: any[]) => any) => {
      instance.type = type;
    },

  useEntity: (instance) =>
    /**
     * Get the Entity that this Component belongs to.
     */
    () => instance.entity,

  useCallbackAsCurrent: (instance) =>
    /**
     * Wrap the provided callback such that if it is called in the future,
     * hook functions inside will be bound to the current Component instance.
     *
     * If you are passing a callback that could contain hook function calls in it
     * from one Component to another, then as the receiver, you should wrap whatever
     * you receive with this, so that it remains bound to the Component instance of
     * the Component that gave it to you.
     *
     * Generally, you shouldn't need to use this yourself, but many Components
     * in `@hex-engine/2d` rely on this to register event handler and animation
     * frame callbacks.
     *
     * @param callback The function to wrap.
     */
    <Func extends (...args: any[]) => any>(
      callback: Func
    ): ((...args: Parameters<Func>) => ReturnType<Func>) => {
      const func = (...args: Parameters<Func>): ReturnType<Func> => {
        return HooksSystem.withInstance(instance, () => {
          return callback(...args);
        });
      };
      // To make debugging easier
      func.toString = () => "useCallbackAsCurrent(" + callback.toString() + ")";
      return func;
    },

  useStateAccumulator: (instance) =>
    /**
     * Create an object associated with the current Component instance that will
     * hold one or more values within. You can add values to this object using
     * the `add` method, and retrieve all the values that have been added
     * using the `all` method.
     *
     * This object is called a "State Accumulator".
     *
     * Additionally, you can retrieve a State Accumulator from a Component instance
     * by using its `.stateAccumulator` method.
     *
     * You probably won't need to use this directly, but it is used by several
     * hooks and Components in `@hex-engine/2d` to collect data from potential
     * consumers of those hooks/Components.
     *
     * The most common usage of `useStateAccumulator` is to use it to collect
     * functions that you'll call at some point in the future, and then
     * iterate over them with `.all()` and call them, when it's time.
     *
     * @param key A unique Symbol that will be used to store this State
     * Accumulator on the Component instance. To get back the same State
     * Accumulator later, pass in the same symbol to either
     * `useStateAccumulator` or `component.stateAccumulator`.
     */
    <T>(key: symbol): { add(newValue: T): void; all(): Array<T> } => {
      return instance.stateAccumulator<T>(key);
    },

  useIsEnabled: (instance) =>
    /**
     * Get a boolean value indicating whether the current Component is enabled.
     *
     * To define what should happen when your Component is enabled or disabled,
     * use `useEnableDisable`.
     */
    () => instance.isEnabled,

  useChild: (instance) =>
    /**
     * Create a new Entity and add it as a child to the current Entity.
     *
     * @param componentFunction The Component function for the first Component
     * that will be added to the new Entity.
     */
    <T>(
      componentFunction: () => T
    ): EntityInterface & {
      rootComponent: T extends {} ? T & ComponentInterface : ComponentInterface;
    } => {
      const ent = instance.entity;
      return Entity._create(componentFunction, ent);
    },
});

export default HooksSystem;
