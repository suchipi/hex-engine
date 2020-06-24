---
title: Sharing Things Between Multiple Components
---

Often while building a game with Hex Engine, you end up in a situation where you need to share something between multiple components, but it's not obvious how to share it. This guide explains one way to do it, known as the "StorageFor" pattern.

The idea behind the "StorageFor" pattern is that you have a component that holds some state or reference, and put it on the root entity. Then, when other components need that state or reference, they get it off of the root entity.

I'll first show a naive implementation of the "StorageFor" pattern, and then how to improve it by using hooks.

## Naive Approach

First, create a component that holds some state; in this case, a player name:

```ts
// StorageForPlayerName.ts
import { useType } from "@hex-engine/core";

// A component that stores the player name. It should be placed on the root entity.
export default function StorageForPlayerName(name: string) {
  useType(StorageForPlayerName);

  return { name };
}
```

Next, instantiate that component in your Root component function, so it gets put on the root entity:

```ts
// Root.ts
import { useType, useNewComponent } from "@hex-engine/core";
import StorageForPlayerName from "./StorageForPlayerName"; // The function from the first code block

function Root() {
  useType(Root);

  useNewComponent(() => StorageForPlayerName("Default Name"));
}
```

Now, you can create a component that accesses the state from the component we created earlier:

```ts
// SomeComponentThatWantsPlayerName.ts
import { useType, useRootEntity } from "@hex-engine/core";
import StorageForPlayerName from "./StorageForPlayerName"; // The function from the first code block

function SomeComponentThatWantsPlayerName() {
  useType(SomeComponentThatWantsPlayerName);

  const rootEntity = useRootEntity();
  const storageForPlayerName = rootEntity.getComponent(StorageForPlayerName);
  if (!storagePlayerName) {
    throw new Error(
      "You forgot to put a StorageForPlayerName component on the root entity!"
    );
  }

  const name = storageForPlayerName.name;

  // Now, you can do something with `name`
}
```

> This approach takes advantage of the fact that if you return an object from a component function, Hex Engine will create getters and setters on the component instance for each property on the returned object.

> You can access those getters/setters via the component instance, which you can get with [`Entity.getComponent`](/docs/api-core#getcomponent).

You can re-use `useRootEntity().getComponent(StorageForPlayerName)` in each component where you need the player name:

```ts
// YetAnotherComponentThatWantsPlayerName.ts
import { useType, useRootEntity } from "@hex-engine/core";
import StorageForPlayerName from "./StorageForPlayerName"; // The function from the first code block

function YetAnotherComponentThatWantsPlayerName() {
  useType(YetAnotherComponentThatWantsPlayerName);

  const rootEntity = useRootEntity();
  const storageForPlayerName = rootEntity.getComponent(StorageForPlayerName);
  if (!storagePlayerName) {
    throw new Error(
      "You forgot to put a StorageForPlayerName component on the root entity!"
    );
  }

  const name = storageForPlayerName.name;

  // Now, you can do something with `name`
}
```

You can also modify the state in the `StorageForPlayerName` component by writing to its `name` property:

```ts
// AComponentThatModifiesPlayerName.ts
import { useType, useRootEntity } from "@hex-engine/core";
import StorageForPlayerName from "./StorageForPlayerName"; // The function from the first code block

function AComponentThatModifiesPlayerName() {
  useType(AComponentThatModifiesPlayerName);

  const rootEntity = useRootEntity();
  const storageForPlayerName = rootEntity.getComponent(StorageForPlayerName);
  if (!storagePlayerName) {
    throw new Error(
      "You forgot to put a StorageForPlayerName component on the root entity!"
    );
  }

  storageForPlayerName.name = "New Name";
}
```

While this approach achieves our goals of sharing things between components, it has some problems:

- Every component that needs the player name needs to import `StorageForPlayerName` and know to look for that component on the root entity
- If you forget to put a `StorageForPlayerName` component on your root entity, things will break, unless every component checks for it

In the below section, we'll eliminate those problems by taking a slightly different approach.

## Improved Approach

We'll start the same way as before, by creating a component that holds the player name:

```ts
import { useType } from "@hex-engine/core";

// A component that stores the player name. It should be placed on the root entity.
function StorageForPlayerName(name: string) {
  useType(StorageForPlayerName);

  return { name };
}
```

Next, we'll
