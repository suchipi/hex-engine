---
title: Understanding the Template's Code
---

Now that you have an idea how the template "game" that `create-hex-engine-game` created behaves, let's dig into the code to understand _why_ it behaves that way. Along the way, we'll get an understanding of how games are built in Hex Engine.

In your code editor, open up `src/index.ts`. This is the first file that runs when your game is opened in the browser.

When you open it up, you should see this:

```ts
// src/index.ts
import { createRoot } from "@hex-engine/2d";
import Root from "./Root";

createRoot(Root);
```

Pretty barebones, huh? Let me explain what's going on here.

Hex Engine implements the [Entity-Component System](https://en.wikipedia.org/wiki/Entity_component_system) (ECS) pattern that is popular in many game engines. There are two important ideas behind ECS:

- Every object in the game is an Entity.
- To add behaviour to an Entity, you add Components to it.

The same holds true in Hex Engine. So with that context in mind, let's review the code again:

```ts
// src/index.ts
import { createRoot } from "@hex-engine/2d";
import Root from "./Root";

createRoot(Root);
```

This code uses the [`createRoot`](/docs/api-core#createrootcomponentfunction-function) function to create the "root Entity". To define the behaviour of the root Entity, we pass in a Component function; in this case, `Root`.

To see what `Root` does, let's open up `src/Root.ts`.

```ts
// src/Root.ts
import {
  useType,
  useNewComponent,
  useChild,
  Canvas,
  Physics,
  Vector,
} from "@hex-engine/2d";
import Floor from "./Floor";
import Box from "./Box";

export default function Root() {
  useType(Root);

  const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
  canvas.fullscreen({ pixelZoom: 3 });

  useNewComponent(Physics.Engine);

  const canvasCenter = new Vector(
    canvas.element.width / 2,
    canvas.element.height / 2
  );

  useChild(() => Floor(canvasCenter.addY(100)));
  useChild(() => Box(canvasCenter));
}
```

There's a lot going on here. Let's go through it bit by bit.

```ts
import {
  useType,
  useNewComponent,
  useChild,
  Canvas,
  Physics,
  Vector,
} from "@hex-engine/2d";
```

First, we import a lot of stuff from [`@hex-engine/2d`](/docs/api-2d) that we're going to use:

- [`useType`](/docs/api-core#usetypecomponentfunction-function-void) is a function we have to call inside every Component function we make.
- [`useNewComponent`](/docs/api-core#usenewcomponentcomponentfunction-function-component) is a function we can call to add a new Component to the current Entity.
- [`useChild`](/docs/api-core#usechildcomponentfunction-function-entity) is a function we can call to create a new Entity as a child of the current Entity.
- [`Canvas`](/docs/api-2d#canvas) is a Component function exported by [`@hex-engine/2d`](/docs/api-2d) that renders children onto a HTML5 [Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) element.
- [`Physics`](/docs/api-2d#physicsbody) is an Object with Component functions on it that make Entities behave like real physical objects.
- [`Vector`](/docs/api-2d#vector) is a class that represents a 2D vector; either a point in space, a width and height, or a length and direction. It has an `x` property and a `y` property.

It's okay if you don't understand all of this right now; it'll make more sense with time.

Continuing on into the file, we find these two imports:

```ts
import Floor from "./Floor";
import Box from "./Box";
```

These are two Component functions that are defined in `src/Floor.ts` and `src/Box.ts`. We'll look into them more in a bit.

If we continue down the file further, we'll find the definition for the `Root` component; the one being used back in `src/index.ts`.

To explain `Root`, I'll put comments inline in the code.

```ts
export default function Root() {
  // We have to call useType as the first thing we do in every Component function.
  useType(Root);

  // Next, we call `useNewComponent` to add a new Component to the current Entity.
  // This means that in addition to the `Root` Component on the root Entity,
  // there will also now be a `Canvas` Component.
  const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));

  // The `Canvas` component we created has a method on it called `fullscreen` which
  // resizes the HTML5 <canvas> element so that it takes up the whole screen. We also
  // specify `pixelZoom` here, which tells the Canvas how many canvas pixels to render per
  // CSS pixel. For a blockier, more pixelated game, set this to a high value; for a smoother,
  // less blocky-looking game, set this to a low value.
  canvas.fullscreen({ pixelZoom: 3 });

  // Next, we add a Physics.Engine component to the current Entity. This means
  // that in addition to the `Root` and `Canvas` components on the root Entity,
  // there will now be a `Physics.Engine` component.
  //
  // The `Physics.Engine` component needs to be on the root Entity in order for
  // other Entities in the game to use physics.
  useNewComponent(Physics.Engine);

  // Next, we make a new `Vector`, setting its `x` and `y` values to the center of
  // the canvas.
  const canvasCenter = new Vector(
    canvas.element.width / 2,
    canvas.element.height / 2
  );

  // Then, we call `useChild` twice, passing in Component functions that construct
  // a `Floor` and `Box`, respectively. `useChild` creates a new Entity as a child
  // of the current Entity, and adds a Component to that child by using the Component
  // function you pass in. So this is creating two new child Entities; one with the `Floor`
  // component, and another with the `Box` component.
  useChild(() => Floor(canvasCenter.addY(100)));
  useChild(() => Box(canvasCenter));
}
```

Hopefully that isn't too much to take in at once. In summary, the `Root` component:

- Creates a Canvas
- Creates a Physics.Engine
- Creates two child Entities: a "Floor" and a "Box".

In the next section, we'll take a look at the `Floor` Component to better understand how it works.
