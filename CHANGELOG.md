# Changelog

### 0.9.2

- Bumped TypeScript version to 4.9.5 to work around an issue in a dependency.

### 0.9.1

- Adds `createChild`, `addChild`, and `removeChild` methods to Entity.
- Prints a warning in non-production builds when attempting to use a `Mouse` component without any associated Geometry.

### 0.9.0

- Fixes several bugs related to Ogmo project and level importing (@suchipi).

### 0.8.1

- Disabled performance hints (size, etc) for production webpack builds, since they are considered errors when the env var `CI` is true (@PxlBuzzard)

### 0.8.0

- Fixes a bug where changes in framerate over time were not properly handled by the physics engine (@suchipi)
- Fixes some comments that still referred to the Vector class as "Point" (its old name) (@suchipi)
- Change default tile rendering behavior for Ogmo tile layers and make the behaviour customizable via new `tileRenderer` option in `useLevel` (@suchipi)
- Ogmo tile layers will now be drawn as if their origin was at the center of the level, to make drawing behaviour consistent with how normal entities behave. In 0.7.1, they were drawn as if their origin was at the top-left. (@suchipi)

### 0.7.1

- Fixes a bug where mouse positions were reported inaccurately if you modified the canvas's transformation matrix (ie. with a Camera component you made). (@suchipi)
- Adds an option to `LowLevelMouse` that makes it report world or screen positions instead of entity positions. (@suchipi)

### 0.7.0

#### Remove backstage (@suchipi)

Unfortunately, `clearRect` is really slow on Firefox, and the idea of backstage is that it gets cleared between every component.

I built backstage to reduce memory usage (since different components would be able to share one scratchpad buffer), but it's _really_ hurting CPU usage in Firefox. So I've decided to remove it.

Considering so few people are using it, I don't think it's worth hurting everyone's CPU usage (more significantly so on non-Chrome) to make it easier to use less memory for the few people who use backstage.

If you need something like backstage in your components, you can create your own canvas element and use `useCanvasSize` to keep your canvas element's size in sync with the game's canvas element.

### 0.6.1

- Adds support for embedded tilesets in Tiled maps (@mmahandev)
- Adds support for xml encoding in Tiled map data (@mmahandev)

### 0.6.0

- Support for modified text baseline (@suchipi)
  - Previously, it was wrongly assumed that `context.textBaseline` would always be set to `"alphabetic"`, and that the desired effective baseline for printing text would behave as if `context.textBaseline` was set to `"top"`. Now, `SystemFont`, `BMFont`, and `Label` all support `context.textBaseline` properly, and also allow passing a baseline via their options argument.
  - In order to support this change, the return type for `FontMetrics` was changed.
  - If you are upgrading your game from an older version and find that text is now being rendered incorrectly, try passing `baseline: "top"` as an argument to your text drawing method(s), to emulate the old behavior.

### 0.5.3

- Inspector is now stubbed out in production builds (@suchipi)
- Add Image#asPattern (@suchipi)

## 0.5.2

- Added `Entity#hasComponent`, `Entity#addComponent`, and `Entity#removeComponent` (@suchipi)

## 0.5.1

Re-publish 0.5.0, because not all features were included (on accident)

## 0.5.0

- Versions are now consistent across all packages; from now on:

  - If there's a version of one package (eg 0.5.0), every package will have a 0.5.0
  - `npx create-hex-engine-app@0.5.0 my-game` will create a repo that points to the specified version, instead of the latest version
  - Changelogs will all be combined in one place

- `Entity#takeChild` added, to transfer a child entity from one parent to another (@coyotte508)
- `Vector#dotProduct(other)` added (@coyotte508)
- `Vector#perpendicular` and `Vector#perpendicularMutate` added (@coyotte508, @arya-s)
- Internal `Ogmo` types are now exported (@PxlBuzzard)
- `Ogmo`, `Tiled`, and `Physics` types moved under their namespaces (instead of having prefixes) (@suchipi)
- Added `onCanvasLeave` and `onCanvasEnter` to `LowLevelMouse` (@sixty-nine, @suchipi)
- Fixed a crash when localStorage wasn't available (@coyotte508)
- Added options for `hex-engine-scripts`, to support building libraries (@suchipi)

## Before 0.5.0

Version history was complicated because each package avoided unnecessary semver bumps for their API on their own, which made it really hard to understand what changes were affecting the whole. However, for historical purposes, the contents of the split changelog for `@hex-engine/2d` and `@hex-engine/core` are listed below:

---

# Old Changelog for `@hex-engine/2d`

# 0.4.2

Fixed type errors when using package with TypeScript 3.9.

# 0.4.0, 0.4.1

Added support for Ogmo Editor and added a testing framework.

# 0.3.4

## The result of `useEntitiesAtPoint` is now cached for the duration of each frame.

This improves performance, because calling `useEntitiesAtPoint` many times per frame is common (when using many entities with `Geometry` components (since those `Geometry` comonents add `Mouse` components, which add `MousePosition` components, which call `useEntitiesAtPoint` once per entity per frame), and under most cases, it should return the same value (within the same frame).

Do note, though, that this means that `useEntitiesAtPoint` could return outdated data for a portion of a frame, if you move an entity within a `useUpdate` callback, and that movement causes it to be under the cursor (or no longer under the cursor). However, the data will be correct on the next frame.

## Upgraded `@hex-engine/inspector` to 0.3.4 (non-breaking change)

This inspector version includes new features and bugfixes.

# 0.3.3

## Upgraded `@hex-engine/inspector` to 0.3.3 (non-breaking change)

This fixes a Typescript error due to the types for React not being included in the inspector.

# 0.3.2

## New feature: Select entity from Inspector

(Upgraded `@hex-engine/inspector` to 0.3.2 (non-breaking change))

This adds a feature to select rendered entities for inspection in the Inspector tree if the Inspector is in entity select mode.

## Bugfix: canvas.setPixelated wasn't working as intended

`imageSmoothingEnabled` wasn't getting set properly; now, it is.

# 0.3.1

## Upgraded `@hex-engine/core` to 0.3.1 (non-breaking change)

This fixes a bug where Components could not be re-disabled after they were disabled and then enabled.

# 0.3.0

## Upgraded `@hex-engine/core` to 0.3.0 (breaking change)

- `useIsEnabled` has been removed; use `useEnableDisable().isEnabled` instead
- `StateAccumulator` APIs (`useStateAccumulator`, `useListenerAccumulator`, `Component.stateAccumulator`, `Entity.stateAccumulator`) have been removed. Persist state in components instead:

```ts
// Before
const FRUITS = Symbol("FRUITS");

function MyComponent() {
  // To persist state per-MyComponent:
  const fruits = useStateAccumulator<string>(FRUITS);
  // Or, to persist state per-entity:
  const fruits = useEntity().stateAccumulator<string>(FRUITS);
  // Or, to persist state in the root entity:
  const fruits = useRootEntity().stateAccumulator<string>(FRUITS);

  // Do something with fruits
}

// After
function FruitStorage() {
  useType(FruitStorage);

  return {
    fruits: new Set<string>();
  }
}

function MyComponent() {
  // To persist state per-MyComponent:
  const {fruits} = useNewComponent(FruitStorage);
  // Or, to persist state per-entity:
  const {fruits} = useEntity().getComponent(FruitStorage) || useNewComponent(FruitStorage);
  // Or, to persist state in the root entity:
  const {fruits} = useRootEntity().getComponent(FruitStorage) || useNewRootComponent(FruitStorage);

  // Do something with fruits
}
```

## Implicit `Physics.Engine`

If you try to use a `Physics.Body` without having a `Physics.Engine` on the root component, it used to throw an error asking you to add one to the root component. Now, it will instead create one for you (with default settings). If you create your own `Physics.Engine` on the root component, then the behaviour is the same as it was prior to 0.3.0.

# 0.2.0

## `Vector`, `Angle`, and `Point` changes (breaking change)

- `Vector` and `Angle` have been removed; their methods and properties have been moved into `Point`.
- `Point` has been renamed to `Vector`.
- All places where `Angle` instances were present before, now bare numbers are used. For instance, `Geometry`'s `rotation` property used to be an `Angle`, but now it's a `number`.

# 0.1.0

Not documented

---

# Old Changelog for `@hex-engine/core`

# Changelog

# 0.4.0, 0.4.1

Added a testing framework.

# 0.3.2

## Upgraded `@hex-engine/2d` and `@hex-engine/inspector` to 0.3.2 (non-breaking change)

This adds a feature to select rendered entities for inspection in the Inspector tree if the Inspector is in entity select mode.

# 0.3.1

Fixed a bug where Components could not be re-disabled after they were disabled and then enabled.

# 0.3.0

## New hook: `useNewRootComponent`

It's like `useNewComponenent`, but instead of adding the new component to the current component's entity, it adds it to the root entity. Check [the docs](https://hex-engine.dev/docs/api-core#usenewrootcomponent) for more info.

## `useIsEnabled` removed

Use `useEnableDisable().isEnabled` instead.

## `StateAccumulator` APIs removed

`useStateAccumulator`, `useListenerAccumulator`, `Component.stateAccumulator`, and `Entity.stateAccumulator` have been removed. Persist state in components instead:

```ts
// Before
const FRUITS = Symbol("FRUITS");

function MyComponent() {
  // To persist state per-MyComponent:
  const fruits = useStateAccumulator<string>(FRUITS);
  // Or, to persist state per-entity:
  const fruits = useEntity().stateAccumulator<string>(FRUITS);
  // Or, to persist state in the root entity:
  const fruits = useRootEntity().stateAccumulator<string>(FRUITS);

  // Do something with fruits
}

// After
function FruitStorage() {
  useType(FruitStorage);

  return {
    fruits: new Set<string>();
  }
}

function MyComponent() {
  // To persist state per-MyComponent:
  const {fruits} = useNewComponent(FruitStorage);
  // Or, to persist state per-entity:
  const {fruits} = useEntity().getComponent(FruitStorage) || useNewComponent(FruitStorage);
  // Or, to persist state in the root entity:
  const {fruits} = useRootEntity().getComponent(FruitStorage) || useNewRootComponent(FruitStorage);

  // Do something with fruits
}
```

## Implicit `RunLoop`

Previously, if you tried to use `useFrame` without a `RunLoop` present on the root component, an error would be thrown. Now, a `RunLoop` will be created for you. If there is already a `RunLoop` present when you call `useFrame`, it won't create another one.

# 0.1.0

Not documented
