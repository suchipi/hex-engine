# Changelog

# 0.3.2

## Upgraded `@hex-engine/2d` and `@hex-engine/inspector` to 0.3.2 (non-breaking change)

This adds a feature to select rendered entities for inspection in the Inspector tree if the Inspector is in entity select mode.

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
