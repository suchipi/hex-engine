# Changelog

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
