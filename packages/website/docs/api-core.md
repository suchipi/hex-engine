---
title: "@hex-engine/core"
---

`@hex-engine/core` is the package that provides the core Entity and Component logic in Hex Engine. Although you likely won't use it directly, it's good to know it exists- many of the hooks and Component functions exported from [`@hex-engine/2d`] are just being re-exported from `@hex-engine/core`.

The `@hex-engine/core` package has several named exports, which are each documented here.

## Types

### Entity

> Available since version: 0.0.0

```ts
import { Entity } from "@hex-engine/core";
```

An Entity instance. The most common way to make one of these is via [`useChild`],
but you also get one returned by [`createRoot`]. You can get the Entity for the current
component by using [`useEntity`].

#### Properties

##### name

> Available since version: 0.0.0

`name: string | null`

A name that will be shown in the inspector, for debugging purposes.
You can set this using [`useEntityName`]. If you don't set one, we will
try to infer one, based on the name of the root [`Component`].

##### id

> Available since version: 0.0.0

`id: number`

A unique id for this Entity. These start at zero and go up by one
whenever you create an Entity.

##### children

> Available since version: 0.0.0

`children: Set<Entity>`

This Entity's child [entities][`entity`]. These get here from components on
this Entity calling [`useChild`], or from code anywhere calling [`Entity.createChild`], [`Entity.addChild`], or [`Entity.takeChild`].

##### parent

> Available since version: 0.0.0

`parent: Entity`

The parent [`Entity`] for this Entity, or null if there isn't one.
Generally, this will only ever be null if you're dealing with the root Entity.

##### components

> Available since version: 0.0.0

`components: Set<Component>`

All the [`Component`] instances that belong to this Entity.

#### Methods

##### descendants

> Available since version: 0.0.0

`descendants(): Array<Entity>`

Search this Entity's children recursively for their children,
and return an Array containing every Entity that is a descendant
of this one.

##### ancestors

> Available since version: 0.0.0

`ancestors(): Array<Entity>`

Find this Entity's parent, then this Entity's parent's parent, and so on,
until there aren't any parents left. Then return the list as an Array.

The Array will be ordered such that the earliest ancestor (the root
entity) is first in the Array, and the most-recent ancestor (this Entity's
parent) will be last in the Array.

##### createChild

> Available since version: 0.9.1

`createChild(componentFunction: Function): Entity`

Constructs a new Entity using the provided component function,
then adds it to this Entity.

This is the same as [`useChild`], but instead of being bound to the current Entity, it adds it to the Entity you call `createChild` on.

##### addChild

> Available since version: 0.9.1

`addChild(child: Entity): void`

Adds a child Entity to this Entity.

If the child already has a parent, an Error will be thrown. You might want to call [`Entity.takeChild`] in that situation instead.

##### removeChild

> Available since version: 0.9.1

`removeChild(child: Entity): void`

Removes a child Entity from this Entity.

If the child is not a child of this Entity, an Error will be thrown.

NOTE: If you are not going to move this child to a new parent, then you MUST call [`Entity.destroy`] on it, or else any destroy callbacks registered by its components (via [`useDestroy`]) will not be called.

##### getComponent

> Available since version: 0.0.0

`getComponent(componentFunc: Function): Component | null`

Searches the entity for a [`Component`] with the type specified by `componentFunc`,
and returns the first one found. If none are found, it returns null.

Note that in order to be found by this function, the Component _must_
have registered its type using [`useType`].

##### hasComponent

> Available since version: 0.5.2

`hasComponent(componentFunc: Function): boolean`

Searches the entity for a [`Component`] with the type specified by `componentFunc`,
and returns true if one is found. If none are found, it returns false.

Note that in order to be found by this function, the Component _must_
have registered its type using [`useType`].

##### addComponent

> Available since version: 0.5.2

`addComponent(componentFunc: Function): Component`

Creates a new Component and adds it to the entity. Returns the component instance for the created component.

This behaves the same as `useNewComponent`, but can be used to add a Component later in an Entity's lifecycle.

##### removeComponent

> Available since version: 0.5.2

`removeComponent(component: Component): void`

Removes a component instance from the entity. The component will be disabled prior to being removed. To define what should happen when your Component is disabled, use [`useEnableDisable`][`useenabledisable`].

##### enable

> Available since version: 0.0.0

`enable(): void`

Enable all [`Component`]s on this Entity and its [descendants][`entity.descendants`].

Use the [`useEnableDisable`] hook to specify what happens when a [`Component`] is enabled or disabled.

##### disable

> Available since version: 0.0.0

`disable(): void`

Disable all [`Component`]s on this Entity and its [descendants][`entity.descendants`].

Use the [`useEnableDisable`] hook to specify what happens when a [`Component`] is enabled or disabled.

##### takeChild

> Available since version: 0.5.0

`takeChild(entity: Entity)`

Transfer the ownership of `entity` to this Entity, so that it becomes the
[parent][`entity.parent`] of `entity`.

##### destroy

> Available since version: 0.1.2

`destroy(): void`

Destroy this entity and remove it from the tree.

This runs all onDestroy callbacks registered via [`useDestroy`],
on this Entity and all of its children.

Additionally, all entities are [disabled][`entity.disable`] prior to being destroyed.

### Component

> Available since version: 0.0.0

```ts
import { Component } from "@hex-engine/core";
```

A Component instance. Every Component created via [`useNewComponent`], [`useChild`] or [`createRoot`] has these properties and methods available on it, in addition to any properties or methods on the object returned by its Component function (if any).

#### Properties

##### type

> Available since version: 0.0.0

`type: Function | null`

The Component function that this Component instance cooresponds to.
This gets set when you call [`useType`], and it _must_ be set in order
for this Component instance to be returned from [`Entity.getComponent`].

##### entity

> Available since version: 0.0.0

`entity: Entity`

The Entity this Component belongs to. Inside of a Component function,
you can call [`useEntity`] to get this.

##### isEnabled

> Available since version: 0.0.0

`isEnabled: boolean`

Whether this Component is currently "enabled". To define what should
happen when your Component is enabled or disabled, use [`useEnableDisable`].

#### Methods

##### enable

> Available since version: 0.0.0

`enable(): void`

Enable this Component.

Use the [`useEnableDisable`] hook to specify what happens when a [`Component`] is enabled or disabled.

##### disable

> Available since version: 0.0.0

`disable(): void`

Disable this Component.

Use the [`useEnableDisable`] hook to specify what happens when a [`Component`] is enabled or disabled.

## Functions

### createRoot

> Available since version: 0.0.0

`createRoot(componentFunction: Function)`

```ts
import { createRoot } from "@hex-engine/core";
```

Creates the root [`Entity`] for your game. Pass it a Component function; it will use it to make a new [`Component`] and add it to a new Entity, which it then returns.

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

### useType

> Available since version: 0.0.0

`useType(componentFunction: Function): void`

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

### useNewComponent

> Available since version: 0.0.0

`useNewComponent(componentFunction: Function): Component`

```ts
import { useNewComponent } from "@hex-engine/core";
```

Create a new [`Component`] and add it to the current Component's Entity.
Returns an object that has all the properties and methods of a [`Component`] instance as well as all the properties and methods of the object returned by the provided Component function (if any).

Note that the Component function passed into `useNewComponent` will only be called _once_, in order to create the Component instance.

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

### useEntity

> Available since version: 0.0.0

`useEntity(): Entity`

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

### useChild

> Available since version: 0.0.0

`useChild(componentFunction: Function): Entity`

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

### useCallbackAsCurrent

> Available since version: 0.0.0

`useCallbackAsCurrent(callback: Function): Function`

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

### useDestroy

> Available since version: 0.0.1

`useDestroy(): { onDestroy(callback: () => void), destroy(): void }`

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

### useEnableDisable

> Available since version: 0.0.0

`useEnableDisable(): { onEnabled(callback: () => void), onDisabled(callback: () => void) }`

```ts
import { useEnableDisable } from "@hex-engine/core";
```

Returns an objest with three properties on it: `isEnabled`, `onEnabled` and `onDisabled`.

- `isEnabled` is a writable boolean indicating whether the component is currently [enabled][`component.enable`].
- `onEnabled` is a function that registers another function to be called when the current Component is [enabled][`component.enable`].
- `onDisabled` is a function that registers another function to be called when the current Component is [disabled][`component.disable`].

> In versions prior to 0.3.0, the `isEnabled` property was not present.

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

### useEntityName

> Available since version: 0.0.0

`useEntityName(name?: string): string | null`

```ts
import { useEntityName } from "@hex-engine/core";
```

Sets or gets the name of the current Entity.

This is just a nice-to-have for debugging purposes; if you don't do this, we will do our best to give the Entity a name based on its root Component.

> In version 0.0.0, this hook could only set the entity name. The functionality to get the entity name was added in version 0.0.2, but the `name` parameter mistakenly remained required until version 0.1.3.

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

### useFrame

> Available since version: 0.0.0

`useFrame(frameCallback: (delta: number) => void): void`

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

### useRootEntity

> Available since version: 0.0.0

`useRootEntity(): Entity`

```ts
import { useRootEntity } from "@hex-engine/core";
```

Searches upwards through the current [`Entity`]'s parents and finds the first
Entity without a parent; namely, the root entity.

This will always be the Entity you created via [`createRoot`].

Note: This hook is equivalent to running `useEntity().ancestors()[0]`.

#### Usage

```ts
import { useType, useRootEntity } from "@hex-engine/core";

function MyComponent() {
  useType(MyComponent);

  const rootEnt = useRootEntity();
}
```

### useCurrentComponent

> Available since version: 0.3.0

`useCurrentComponent(): Component`

```ts
import { useCurrentComponent } from "@hex-engine/core";
```

Gives you the current Component instance; the instance for the Component whose Component function is currently executing.

This component is an escape hatch; the only useful thing you can do with it (that you can't do with other hooks) is use its return value as a WeakMap key. The main time you would want to do this is when you want a hook to transparently correlate some state with a component instance so that another Component can retrieve it later.

#### Usage

To demonstrate how you can use `useCurrentComponent`, I'm going to make a hook that associates a "color" with each component. Then, I'll make a component that uses those colors.

In order to persist state related to each component instance (rather than the entire entity instance), I'll use `useCurrentComponent` to get the component instance, so I can use it as a WeakMap key. Then, when I want to retrieve the state later, I can use the component instance as a WeakMap key again.

It's a pretty contrived example, but this pattern is how hooks like [`useDraw`](/docs/api-2d#usedraw), [`useUpdate`](/docs/api-2d#useupdate), [`useEnableDisable`](#useenabledisable),and [`useInspectorHover`](/docs/api-inspector#useinspectorhover) are implemented.

```ts
import {
  useType,
  Component,
  useEntity,
  useNewComponent,
  useCurrentComponent,
  useRootEntity,
} from "@hex-engine/core";

function StorageForUseColor() {
  useType(StorageForUseColor);

  return {
    componentColors: new WeakMap<Component, string>(),
  };
}

function useColor(color: string) {
  // Get the "StorageForUseColor" component off of the current component's Entity, if it has one
  let storage = useEntity().getComponent(StorageForUseColor);
  if (!storage) {
    // If there's no StorageForUseColor on the entity yet, create one and add it
    storage = useNewComponent(StorageForUseColor);
  }

  // Now, write the color into the WeakMap, using the component instance as the key:
  const component = useCurrentComponent();
  storage.componentColors.set(component, color);
}

// Now, let's make a component that gets the colors for all the components in the tree and prints them:
function ColorPrinter() {
  useType(ColorPrinter);

  const rootEntity = useRootEntity();
  const allEntities = [rootEntity, ...rootEntity.descendants()];

  for (const entity of allEntities) {
    const storage = entity.getComponent(StorageForUseColor);
    if (storage) {
      for (const component of entity.components) {
        const colorForComponent = storage.componentColors.get(component);
        if (colorForComponent) {
          console.log(colorForComponent);
        }
      }
    }
  }
}
```

### useNewRootComponent

> Available since version: 0.3.0

`useNewRootComponent(): Component`

```ts
import { useNewRootComponent } from "@hex-engine/core";
```

Like [`useNewComponent`], but instead of placing the newly-created component on the current Entity instance, it gets placed on the root Entity.

#### Usage

This is mostly used by hook functions that need some "global" state or "global" listeners.

For instance, consider a hypothetical `useWindowSize` hook function that returns the current window size.
You _could_ create a new window resize event listener every time `useWindowSize` is called:

```ts
function useWindowSize() {
  const size = { x: window.innerWidth, y: window.innerHeight };

  window.addEventListener("resize", () => {
    size.x = window.innerWidth;
    size.y = window.innerHeight;
  });

  return size;
}
```

But since every consumer of `useWindowSize` wants the same values, it's more efficient to only create one event listener, and re-use its results:

```ts
import { useType, useRootEntity, useNewRootComponent } from "@hex-engine/core";

function WindowSizeListener() {
  useType(WindowSizeListener);

  // We moved all the code that *was* in useWindowSize into a Component function
  const size = { x: window.innerWidth, y: window.innerHeight };

  window.addEventListener("resize", () => {
    size.x = window.innerWidth;
    size.y = window.innerHeight;
  });

  return { size };
}

function useWindowSize() {
  // If there's already a WindowSizeListener component on the root entity, use it...
  let listenerComponent = useRootEntity().getComponent(WindowSizeListener);

  // But if there's not one yet, put one there, then use it.
  if (!listenerComponent) {
    listenerComponent = useNewRootComponent(WindowSizeListener);
  }

  return listenerComponent.size;
}
```

## Components

### RunLoop

> Available since version: 0.0.0

`RunLoop()`

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

### ErrorBoundary

> Available since version: 0.0.0

`ErrorBoundary(onError: (error: Error) => void)`

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

[`@hex-engine/2d`]: /docs/api-2d
[`@hex-engine/inspector`]: /docs/api-inspector
[`entity`]: #entity
[`entity.name`]: #name
[`entity.id`]: #id
[`entity.children`]: #children
[`entity.parent`]: #parent
[`entity.components`]: #components
[`entity.descendants`]: #descendants
[`entity.ancestors`]: #ancestors
[`entity.createchild`]: #createchild
[`entity.addchild`]: #addchild
[`entity.removechild`]: #removechild
[`entity.ancestors`]: #ancestors
[`entity.takechild`]: #takechild
[`entity.getcomponent`]: #getcomponent
[`entity.hascomponent`]: #hascomponent
[`entity.addcomponent`]: #addcomponent
[`entity.removecomponent`]: #removecomponent
[`entity.enable`]: #enable
[`entity.disable`]: #disable
[`entity.destroy`]: #destroy
[`component`]: #component
[`component.type`]: #type
[`component.entity`]: #entity-1
[`component.isenabled`]: #isenabled
[`component.enable`]: #enable-1
[`component.disable`]: #disable-1
[`createroot`]: #createroot
[`usetype`]: #usetype
[`usenewcomponent`]: #usenewcomponent
[`useentity`]: #useentity
[`usechild`]: #usechild
[`usecallbackascurrent`]: #usecallbackascurrent
[`usedestroy`]: #usedestroy
[`useenabledisable`]: #useenabledisable
[`useentityname`]: #useentityname
[`useframe`]: #useframe
[`userootentity`]: #userootentity
[`usecurrentcomponent`]: #usecurrentcomponent
[`runloop`]: #runloop
[`errorboundary`]: #errorboundary
[`canvas`]: /docs/api-2d#canvas
[`useupdate`]: /docs/api-2d#useupdate
[`usedraw`]: /docs/api-2d#usedraw
