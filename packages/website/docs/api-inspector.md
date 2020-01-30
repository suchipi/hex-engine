---
title: "@hex-engine/inspector"
---

`@hex-engine/inspector` is the package that provides the inspector controls and overlay, that let you pause/resume frame execution as well as look at and edit current Entity and Component state.

For info about how to use the inspector, check out [First Time Setup](/docs/first-time-setup).

`@hex-engine/inspector` in written in such a way that it is not tied to [`@hex-engine/2d`]; instead, it only depends on [`@hex-engine/core`], and exports hooks and component functions that get used by [`@hex-engine/2d`]. This design is intentional; if, in the future, new renderers are created for Hex Engine (by using the base in [`@hex-engine/core`]), then the inspector will still be compatible with them. I have plans to create a 3D renderer in a few years after the 2D one has matured, and someone on Twitter indicated interest in making a Terminal renderer.

Anyway, here's the API documentation for `@hex-engine/inspector`. Note that most users will not use the inspector API directly; they will get it as part of [`@hex-engine/2d`].

## Components

### Inspector

> Available since version: 0.0.0

```ts
import Inspector from "@hex-engine/inspector";
```

`Inspector(): void`

A Component function that renders an Inspector overlay onto the page, that shows you information about the current Entity tree, and allows you to tweak values and pause/resume/step frame execution.

It stores its state (which things are opened, whether you are paused, etc) in localStorage, so that state persists across page refreshes.

Note that the Inspector is pretty performance-heavy while open.

Since the Inspector lowers the framerate while open, and allows you to tweak Component and Entity values arbitrarily, you probably don't want to include it in your final game release. If you are using [`@hex-engine/2d`], it will be omitted from your optimized production bundle automatically.

#### Usage

```ts
import { useType, useNewComponent } from "@hex-engine/core";
import Inspector from "@hex-engine/inspector";

function MyComponent() {
  useType(MyComponent);

  useNewComponent(Inspector);
}
```

## Hooks

### useInspectorHover

> Available since version: 0.0.0

```ts
import { useInspectorHover } from "@hex-engine/inspector";
```

`useInspectorHover(): { isHovered: boolean, onHoverStart(callback: () => void): void, onHoverEnd(callback: () => void): void }`

Returns an object with three properties:

- `isHovered`: Whether the current Component, Entity, or one of its parents is
  currently being hovered over in the Inspector.
- `onHoverStart`: Register a function to be run when the user starts hovering over
  the current Component, Entity, or one of its parents in the Inspector.
- `onHoverEnd`: Register a function to be run when the user stops hovering over
  the current Component, Entity, or one of its parents in the Inspector.

The idea here is that when someone hovers over the Component or Entity in the
Inspector, you visually highlight the corresponding rendered objects, if any.

#### Usage

```ts
import { useType } from "@hex-engine/core";
import { useInspectorHover } from "@hex-engine/inspector";

function MyComponent() {
  useType(MyComponent);

  // There are two ways to use useInspectorHover; use whichever fits your situation.

  // ---
  // First way:
  // ---
  const { isHovered } = useInspectorHover();

  if (isHovered) {
    // draw some kind of overlay outline around the current entity or component
  } else {
    // don't draw one
  }

  // ---
  // OR, second way:
  // ---
  const { onHoverStart, onHoverEnd } = useInspectorHover();

  onHoverStart(() => {
    // Add some kind of overlay outline to the game
  });

  onHoverEnd(() => {
    // Remove the overlay outline from the game
  });
}
```

[`@hex-engine/core`]: /docs/api-core
[`@hex-engine/2d`]: /docs/api-2d
