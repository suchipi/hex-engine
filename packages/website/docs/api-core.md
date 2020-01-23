---
title: @hex-engine/core
---

`@hex-engine/core` is the package that provides the core Entity and Component logic in Hex Engine. Although you likely won't use it directly, it's good to know it exists- many of the hooks and Component functions exported from [`@hex-engine/2d`] are just being re-exported from `@hex-engine/core`.

The `@hex-engine/core` package has several named exports, which are each documented here.

## Types

### `Entity`

```ts
import { Entity } from "@hex-engine/core";
```

An Entity instance. The most common way to make one of these is via [`useChild`],
but you also get one returned by [`createRoot`]. You can get the Entity for the current
component by using [`useEntity`].

#### Properties

##### `name: string | null`

A name that will be shown in the inspector, for debugging purposes.
You can set this using [`useEntityName`]. If you don't set one, we will
try to infer one, based on the name of the root [`Component`].

##### `id: number`

A unique id for this Entity. These start at zero and go up by one
whenever you create an Entity.

##### `children: Set<Entity>`

This Entity's child [entities][`entity`]. These get here from components on
this Entity calling [`useChild`].

##### `parent: Entity`

The parent [`Entity`] for this Entity, or null if there isn't one.
Generally, this will only ever be null if you're dealing with the root Entity.

##### `components: Set<`[`Component`]`>`

All the [`Component`] instances that belong to this Entity.

#### Methods

##### `descendants(): Array<Entity>`

Search this Entity's children recursively for their children,
and return an Array containing every Entity that is a descendant
of this one.

##### `ancestors(): Array<Entity>`

Find this Entity's parent, then this Entity's parent's parent, and so on,
until there aren't any parents left. Then return the list as an Array.

The Array will be ordered such that the earliest ancestor (the root
entity) is first in the Array, and the most-recent ancestor (this Entity's
parent) will be last in the Array.

##### `getComponent(componentFunc: Function): Component | null`

Searches the entity for a [`Component`] with the type specified by `componentFunc`,
and returns the first one found. If none are found, it returns null.

Note that in order to be found by this function, the Component _must_
have registered its type using [`useType`].

##### `enable(): void`

Enable all [`Component`]s on this Entity and its [descendants][`entity.descendants`].

Use the [`useEnableDisable`] hook to specify what happens when a [`Component`] is enabled or disabled.

##### `disable(): void`

Disable all [`Component`]s on this Entity and its [descendants][`entity.descendants`].

Use the [`useEnableDisable`] hook to specify what happens when a [`Component`] is enabled or disabled.

### `Component`

```ts
import { Component } from "@hex-engine/core";
```

A Component instance. Every Component created via [`useNewComponent`], [`useChild`] or [`createRoot`] has these properties and methods available on it, in addition to any properties or methods on the object returned by its Component function (if any).

#### Properties

##### `type: Function | null`

The Component function that this Component instance cooresponds to.
This gets set when you call [`useType`], and it _must_ be set in order
for this Component instance to be returned from [`Entity.getComponent`].

##### `entity`: [`Entity`]

The Entity this Component belongs to. Inside of a Component function,
you can call [`useEntity`] to get this.

##### `isEnabled: boolean`

Whether this Component is currently "enabled". To define what should
happen when your Component is enabled or disabled, use [`useEnableDisable`].

#### Methods

##### `enable(): void`

Enable this Component.

Use the [`useEnableDisable`] hook to specify what happens when a [`Component`] is enabled or disabled.

##### `disable(): void`

Disable this Component.

Use the [`useEnableDisable`] hook to specify what happens when a [`Component`] is enabled or disabled.

##### `stateAccumulator<T>(key: Symbol): { add<T>(value: T), all(): Array<T> }`

Gets a State Accumulator associated with this Component instance,
as returned by [`useStateAccumulator`].

You probably won't ever need to use this directly, but some hooks in
[`@hex-engine/2d`] use it to persist state to a Component instance
and retrieve it later.

## Functions

### `createRoot(componentFunction: Function)`

```ts
import { createRoot } from "@hex-engine/core";
```

Creates the root Entity for your game. Pass it a Component function; it will use it to make a new Component and add it to a new Entity, which it then returns.

#### Usage

```ts
import { createRoot } from "@hex-engine/core";

const rootEntity = createRoot(() => {
  // Your component code goes here
});

// rootEntity is an Entity
```

## Hooks

Hooks are special functions that interact with the "current" Component. The current Component gets set by Hex Engine when it instantiates a Component for you. The most common ways to instantiate Components are through [`createRoot`], [`useChild`], and [`useNewComponent`]

### `useType(componentFunction: Function): void`

```ts
import { useType } from "@hex-engine/core";
```

Registers the type of the current component.

In order for components to be [retrievable by type][`entity.getcomponent`], every Component must have a `type` registered. `useType` is how you register that type.

99.9% of the time, you should pass in the constructor function for the current component.

#### Usage

```ts
import { useType } from "@hex-engine/core";

function MyComponent() {
  // Sets `MyComponent` as the current component's `type`.
  // The first line of every Component you write should set
  // its type using `useType`.
  useType(MyComponent);
}
```

### `useNewComponent(componentFunction: Function): Component`

```ts
import { useNewComponent } from "@hex-engine/core";
```

Create a new [`Component`] and add it to the current Component's Entity.
Returns an object that has all the properties and methods of a [`Component`] instance as well as all the properties and methods of the object returned by the provided Component function (if any).

#### Usage

```ts
import { useType, useNewComponent } from "@hex-engine/core";

function MyComponent() {
  useType(MyComponent);

  const { color } = useNewComponent(() => MyOtherComponent("red"));
}

function MyOtherComponent(color: string) {
  useType(MyOtherComponent);

  return { color };
}
```

### `useEntity(): Entity`

```ts
import { useEntity } from "@hex-engine/core";
```

Retrieves and returns the current Component's [`Entity`].

#### Usage

```ts
import { useType, useEntity } from "@hex-engine/core";

function MyComponent() {
  useType(MyComponent);

  const entity = useEntity();
}
```

### `useChild(componentFunction: Function): Entity`

```ts
import { useChild } from "@hex-engine/core";
```

Create a new [`Entity`] (using the provided Component function) and add it as a child to the current Entity.

#### Usage

```ts
import { useType, useChild } from "@hex-engine/core";

function MyComponent() {
  useType(MyComponent);

  useChild(MyOtherComponent);
}

function MyOtherComponent() {
  useType(MyOtherComponent);
}
```

### `useIsEnabled(): boolean`

```ts
import { useIsEnabled } from "@hex-engine/core";
```

Get a boolean value indicating whether the current Component instance is enabled.

To define what should happen when your Component is enabled or disabled,
use [`useEnableDisable`].

#### Usage

```ts
import { useType, useIsEnabled } from "@hex-engine/core";

function MyComponent() {
  useType(MyComponent);

  const isEnabled = useIsEnabled();
}
```

### `useCallbackAsCurrent(callback: Function): Function`

```ts
import { useCallbackAsCurrent } from "@hex-engine/core";
```

Wraps the provided callback function such that it is bound to the current Component instance.

After a function has been wrapped by `useCallbackAsCurrent`, then when it is called in the future, hooks within it will _always_ be run against the Component instance it had when it was wrapped, rather than the current component instance.

Generally, you shouldn't need to use this yourself, but many Components
in [`@hex-engine/2d`] rely on this to register event handler and animation
frame callbacks.

#### Usage

```ts
import {
  useType,
  useCallbackAsCurrent,
  useChild,
  Mouse,
  Entity,
} from "@hex-engine/core";

function MyComponent() {
  useType(MyComponent);

  // This creates a version of `useChild` that is "bound" to the current Component.
  // When it gets called in MyChildComponent, the new Entity will get added to
  // the MyComponent instance, not the MyChildComponent instance, because the
  // function has been "bound" to the current Component.
  const useChildAsMyComponent = useCallbackAsCurrent(useChild);
  useChild(() => MyChildComponent(useChildAsMyComponent));
}

function MyChildComponent(useSibling: (componentFunction: Function) => Entity) {
  useType(MyChildComponent);

  const mouse = useNewComponent(Mouse);

  mouse.onClick(() => {
    useSibling(MyChildComponent);
  });
}
```

### `useStateAccumulator<T>(key: symbol): { add(value: T): void, all(): Array<T> }`

```ts
import { useStateAccumulator } from "@hex-engine/core";
```

Create an object associated with the current Component instance that will
hold one or more values within. You can add values to this object using
the `add` method, and retrieve all the values that have been added
using the `all` method.

This object is called a "State Accumulator".

Additionally, you can retrieve a State Accumulator from a [`Component`] instance
by using its [`.stateAccumulator`][`component.stateaccumulator`] method.

You probably won't need to use this directly, but it is used by several
hooks and Components in [`@hex-engine/2d`].

The most common usage of `useStateAccumulator` is to use it to collect
functions that you'll call at some point in the future, and then
iterate over them with `.all()` and call them, when it's time.

#### Parameters

##### `key`

A unique Symbol that will be used to store this State
Accumulator on the Component instance. To get back the same State
Accumulator later, pass in the same symbol to either
[`useStateAccumulator`] or [`component.stateAccumulator`].

#### Usage

```ts
import {
  useType,
  useNewComponent,
  useStateAccumulator,
} from "@hex-engine/core";

const FRUITS = Symbol("FRUITS");

function MyComponent() {
  useType(MyComponent);

  const fruits = useStateAccumulator<string>(FRUITS);
  fruits.add("apple");

  return {
    addFruit: (fruit: string) => {
      fruits.add(fruit);
    }),
  };
}

function MyOtherComponent() {
  useType(MyOtherComponent);

  const { addFruit } = useNewComponent(MyComponent);

  addFruit("orange");
}
```

### `useDestroy(): { onDestroy(callback: Function), destroy(): void }`

```ts
import { useDestroy } from "@hex-engine/core";
```

Return an object with two functions on it: `onDestroy` and `destroy`.

- `onDestroy` registers a function to be run if the current Entity is destroyed.
- `destroy` destroys the current Entity.

Note: Calling `destroy` will also run any "disable" callbacks on the Entity's components that were registered via [`useEnableDisable`].

#### Usage

```ts
import { useType, useDestroy, useNewComponent, Mouse } from "@hex-engine/core";

function MyComponent() {
  useType(MyComponent);

  const { onDestroy, destroy } = useDestroy();

  onDestroy(() => {
    console.log("Entity destroyed", useEntity());
  });

  const mouse = useNewComponent(Mouse);

  mouse.onClick(() => {
    destroy();
  });
}
```

### `useEnableDisable(): { onEnabled(callback: Function), onDisabled(callback: Function) }`

```ts
import { useEnableDisable } from "@hex-engine/core";
```

Returns an objest with two functions on it: `onEnabled` and `onDisabled`.

- `onEnabled` registers a function to be called when the current Component is [enabled][`component.enable`].
- `onDisabled` registers a function to be called when the current Component is [disabled][`component.disable`].

Note: If the Component is already enabled when you call `onEnabled`, then the function you provide to `onEnabled` will be called immediately. Likewise, if the Component is already disabled when you call `onDisabled`, then the function you provide to `onDisabled` will be called immediately.

#### Usage

```ts
import { useType, useEnableDisable } from "@hex-engine/core";

function MyComponent() {
  useType(MyComponent);

  function handleResize() {
    console.log(
      "Window is now this size:",
      window.innerWidth,
      window.innerHeight
    );
  }

  const { onEnabled, onDisabled } = useEnableDisable();

  onEnabled(() => {
    window.addEventListener("resize", handleResize);
  });

  onDisabled(() => {
    window.removeEventListener("resize", handleResize);
  });
}
```

### `useEntityName(name?: string): string | null`

```ts
import { useEntityName } from "@hex-engine/core";
```

Sets or gets the name of the current Entity.

This is just a nice-to-have for debugging purposes; if you don't do this, we will do our best to give the Entity a name based on its root Component.

#### Usage

```ts
import { useType, useEntityName } from "@hex-engine/core";

function MyComponent() {
  useType(MyComponent);

  // To set the entity name:
  useEntityName("MyComponent instance");

  // To get the entity name:
  const name = useEntityName();
}
```

### `useFrame(frameCallback: (delta: number) => void): void`

```ts
import { useFrame } from "@hex-engine/core";
```

Register a function to be called once every animation frame, via the root Entity's [`RunLoop`] Component. If you are using [`@hex-engine/2d`], you probably don't want to use this; use [`useUpdate`] or [`useDraw`] instead.

#### Usage

```ts
import { useType, useFrame } from "@hex-engine/core";

function MyComponent() {
  useType(MyComponent);

  useFrame((delta) => {
    console.log("This much time has elapsed since the last frame:", delta);
  });
}
```

### `useRootEntity(): Entity`

```ts
import { useRootEntity } from "@hex-engine/core";
```

Searches upwards through the current [`Entity`]'s parents and finds the first
Entity without a parent; namely, the root entity.

This will always be the Entity you created via [`createRoot`].

Note: This hook is equivalent to running `useEntity().ancestors()[0]`.;

#### Usage

```ts
import { useType, useRootEntity } from "@hex-engine/core";

function MyComponent() {
  useType(MyComponent);

  const rootEnt = useRootEntity();
}
```

## Components

### `RunLoop()`

An internal [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)-based RunLoop to be placed on the root [`Entity`].

It lets you register callbacks that should be run every frame, and also has controls to pause, step, and resume frames.

In [`@hex-engine/2d`], this Component is included as part of the root [`Canvas`] component.

The `pause`, `step`, `resume`, `isPaused`, and `frameNumber` functions on the API object for this Component are used by [`@hex-engine/inspector`].

If you are using [`@hex-engine/2d`], you do not need to use this Component directly; use [`Canvas`] instead.

#### Usage

```ts
import { useType, useNewComponent, RunLoop } from "@hex-engine/core";

function MyComponent() {
  useType(MyComponent);

  const runLoop = useNewComponent(RunLoop);
}
```

### `ErrorBoundary(onError: (error: Error) => void)`

Define what should happen if an Error occurs in this Entity or its descendants.
When an Error occurs, it propagates upwards through all ancestor Entities until one of them has an `ErrorBoundary` component that can catch it.

If `onError` throws, then the Error it threw will be passed up to the next
parent error handler.

If no `ErrorBoundary` can be found, the error will be logged via `console.error`.

#### Usage

```ts
import { useType, useNewComponent, ErrorBoundary } from "@hex-engine/core";

function MyComponent() {
  useType(MyComponent);

  useNewComponent(() =>
    ErrorBoundary((err) => {
      console.error("Something bad happened:", err);
    })
  );
}
```

[`@hex-engine/2d`]: api-2d
[`@hex-engine/inspector`]: api-inspector
[`entity`]: #entity
[`entity.name`]: #name-string--null
[`entity.id`]: #id-number
[`entity.children`]: #children-setentity
[`entity.parent`]: #parent-entity
[`entity.components`]: #components-setcomponentcomponent
[`entity.descendants`]: #descendants-arrayentity
[`entity.ancestors`]: #ancestors-arrayentity
[`entity.getcomponent`]: #getcomponentcomponentfunc-function-component--null
[`entity.enable`]: #enable-void
[`entity.disable`]: #disable-void
[`component`]: #component
[`component.type`]: #type-function--null
[`component.entity`]: #entity-entity
[`component.isenabled`]: #isenabled-boolean
[`component.enable`]: #enable-void-1
[`component.disable`]: #disable-void-1
[`component.stateaccumulator`]: #stateaccumulatortkey-symbol--addtvalue-t-all-arrayt-
[`createroot`]: #createrootcomponentfunction
[`usetype`]: #usetypecomponentfunction-function-void
[`usenewcomponent`]: #usenewcomponentcomponentfunction-function-component
[`useentity`]: #useentity-entity
[`usechild`]: #usechildcomponentfunction-function-entity
[`useisenabled`]: #useisenabled-boolean
[`usecallbackascurrent`]: #usecallbackascurrentcallback-function-function
[`usestateaccumulator`]: #usestateaccumulatortkey-symbol--addvalue-t-void-all-arrayt-
[`usedestroy`]: #usedestroy--ondestroycallback-function-destroy-void-
[`useenabledisable`]: #useenabledisable--onenabledcallback-function-ondisabledcallback-function-
[`useentityname`]: #useentitynamename-string-string--null
[`useframe`]: #useframeframecallback-delta-number--void-void
[`userootentity`]: #userootentity-entity
[`runloop`]: #runloop
[`errorboundary`]: #errorboundaryonerror-error-error--void
