# Changelog

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
