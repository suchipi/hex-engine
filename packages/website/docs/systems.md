---
title: Where are the Systems?
---

On July 12 2020, [mmahandev asked](https://github.com/suchipi/hex-engine/issues/68#issue-655480640) the following question on GitHub:

> Are there any suggestions on how to implement the "Systems" part in the ECS pattern? I read through the guides on the website but it only goes over the entity and component part.

I answered their question on GitHub, and they suggested I also publish that information on the website. So here is a copy of the information contained in my answer.

---

> tl;dr: There aren't any explicit Systems, but you can implement them by using Components that communicate with each other.

The line between Systems and Components is blurred in Hex Engine. To create something that behaves like a traditional ECS "System", you actually create a Component, and then make it cooperate with other Components in some way. Generally, there's only one instance of your "System" Component in the game at any given time, for each system (kind of like a Singleton).

The cooperation usually takes on one of two forms; the first form is more like traditional ECS, but the second form is more React-like. In my opinion, the React-like Form is easier to trace through if a reader wanted to understand how things worked, but the Traditional Form can be more performant in some cases. Use whichever you are more comfortable with, and if you find yourself running into issues, try refactoring to the other form.

I'll demonstrate both forms by modeling the following scenario: There are several ships in a map. Some are controlled by players, and some are controlled by the computer. When a ship reaches a refuel station, its fuel is refilled.

Please keep in mind that this scenario is contrived, and a system-like pattern might not be the best way to implement this behavior.

## Traditional Form

- Your "System" Component gathers together an Array of Entities it cares about by using some combination of [useEntity](https://hex-engine.dev/docs/api-core#useentity), [useRootEntity](https://hex-engine.dev/docs/api-core#userootentity), [Entity.descendants](https://hex-engine.dev/docs/api-core#descendants).
- It then checks each of these Entities for a Component it cares about, using [Entity.getComponent](https://hex-engine.dev/docs/api-core#getcomponent).
- It then uses the data exposed by those Components' object return values to perform the appropriate work it should do.

```ts
// A data-only Component
function FuelTank(capacity = 100, initialValue = 0) {
  useType(FuelTank);

  return { capacity, value: initialValue };
}

// A Component that indicates this Entity can refill a tank
function RefillsTank() {
  useType(RefillsTank);
}

// The System Component
function ProcessFuelRefills() {
  useType(ProcessFuelRefills);

  const root = useRootEntity();

  useUpdate(() => {
    const allEntities = root.descendants();
    const refillers = allEntities.filter(ent => ent.getComponent(RefillsTank));
    for (const ent of allEntities) {
      const fuelTank = ent.getComponent(FuelTank);
      // fuelTank will be null if the entity doesn't have a fuel tank
      if (!fuelTank) continue;

      if (refillers.some(refiller => /* return whether ent is colliding with refiller */)) {
        fuelTank.value = fuelTank.capacity;
      }
    }
  });
}

// Then, use those components in your game:
function PlayerShip() {
  useType(PlayerShip);

  const fuelTank = useNewComponent(() => FuelTank(200, 200));

  // render the sprite, etc

  useUpdate(() => {
    if (/* player is pressing boost */) {
      // check fuelTank.value to see if they can go
    }
  });
}

function CpuShip() {
  useType(CpuShip);

  const fuelTank = useNewComponent(() => FuelTank(400, 100));

  // render the sprite, etc

  useUpdate(() => {
    if (/* ai wants to boost */) {
      // check fuelTank.value to see if they can go
    }
  });
}

function RefuelStation() {
  useType(RefuelStation);

  useNewComponent(RefillsTank);

  // render the sprite, etc
}

// Also, don't forget to put a ProcessFuelRefills component in your Root component with useNewComponent.
```

## React-Like Form

- A storage-only component is placed on the root entity to keep track of which entities can refill fuel tanks.
- A hook is created to facilitate access to the set of "refiller" entities.
- The FuelTank component itself checks this list and updates its value if it's colliding with one of the refillers.

```ts
// A storage component that keeps track of all the fuel refilling-entities in the game
function Refillers() {
  useType(Refillers);

  return { set: new Set() };
}

// A hook to get the refillers set, creating a Refillers component to hold this data on the root entity if it doesn't exist
function useRefillers() {
  const root = useRootEntity();
  let refillersListComponent = root.getComponent(Refillers);
  if (!refillersListComponent) {
    refillersListComponent = useNewRootEntity(Refillers);
  }
  return refillersListComponent.set;
}

// A Component that indicates this Entity can refill a tank
function RefillsTank() {
  useType(RefillsTank);

  // Add it to the refillers list
  const ent = useEntity();
  const refillers = useRefillers();

  refillers.add(ent);

  // Remove this ent from the refillers list when it's destroyed
  const { onDestroy } = useDestroy();
  onDestroy(() => {
    refillers.delete(ent);
  });
}

function FuelTank(capacity = 100, initialValue = 0) {
  useType(FuelTank);

  const data = { value: initialValue, capacity };
  const ent = useEntity();

  useUpdate(() => {
    const refillers = useRefillers();

    for (const refiller of refillers) {
      if (/* ent is colliding with refiller */) {
        data.value = data.capacity;
      }
    }
  });

  return data;
}

// Then, use those components in your game:
function PlayerShip() {
  useType(PlayerShip);

  const fuelTank = useNewComponent(() => FuelTank(200, 200));

  // render the sprite, etc

  useUpdate(() => {
    if (/* player is pressing boost */) {
      // check fuelTank.value to see if they can go
    }
  });
}

function CpuShip() {
  useType(CpuShip);

  const fuelTank = useNewComponent(() => FuelTank(400, 100));

  // render the sprite, etc

  useUpdate(() => {
    if (/* ai wants to boost */) {
      // check fuelTank.value to see if they can go
    }
  });
}

function RefuelStation() {
  useType(RefuelStation);

  useNewComponent(RefillsTank);

  // render the sprite, etc
}
```

Keep in mind that these patterns are just examples, and can be changed in a myriad of ways:

- The FuelTank component could have `fillBy`, `isFull`, `isEmpty` functions on it instead, and the capacity and value could be completely hidden from other components
- In the second form, instead of keeping track of refillers and iterating over them in each FuelTank, you could keep track of FuelTanks and iterate over them in each refiller
- In the first form, a hook could be used (like in the second form) so that you don't need to remember to put it on the root component

The long and short of it is that there's no concrete Systems, just your code and what it does.

You may also find the source code for Hex Engine useful; there are several "Systems" there that are implemented in several ways:

- [RunLoop](https://github.com/suchipi/hex-engine/blob/master/packages/core/src/Components/RunLoop.ts), which handles what code should run each frame
- [useEnableDisable](https://github.com/suchipi/hex-engine/blob/master/packages/core/src/Hooks/useEnableDisable.ts), which handles the concept of "enabling" or "disabling" things, and what to do when something is disabled or enabled
- [useFrame](https://github.com/suchipi/hex-engine/blob/master/packages/core/src/Hooks/useFrame.ts), which combines the two to create a hook that lets components register a callback to be run every frame
- [useDestroy](https://github.com/suchipi/hex-engine/blob/master/packages/core/src/Hooks/useDestroy.ts), which lets components destroy the current entity, or specify what should happen when it's destroyed
- [ErrorBoundary](https://github.com/suchipi/hex-engine/blob/master/packages/core/src/Components/ErrorBoundary.ts), which lets components handle errors thrown from their children
- [DrawChildren](https://github.com/suchipi/hex-engine/blob/master/packages/2d/src/Canvas/DrawChildren.ts), which cooperates with `useFrame` and exposes the `useDraw` and `useRawDraw` APIs that allow components to draw to the canvas
- [useWindowSize](https://github.com/suchipi/hex-engine/blob/master/packages/2d/src/Hooks/useWindowSize.ts), which keeps track of the window size and lets components get it and register callbacks to be run when it changes

There are many more systems throughout the codebase; they're all implemented using components that communicate with each other.
