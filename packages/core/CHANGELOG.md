# Changelog

# 0.3.0

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
