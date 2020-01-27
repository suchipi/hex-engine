---
title: Looking At the Floor
---

Go ahead and open up `src/Floor.ts`.

```ts
// src/Floor.ts
import {
  useType,
  useNewComponent,
  Geometry,
  Polygon,
  Point,
  Physics,
  useDraw,
} from "@hex-engine/2d";

export default function Floor(position: Point) {
  useType(Floor);

  const geometry = useNewComponent(() =>
    Geometry({
      shape: Polygon.rectangle(new Point(200, 25)),
      position: position.clone(),
    })
  );

  useNewComponent(() => Physics.Body(geometry, { isStatic: true }));

  useDraw((context) => {
    context.fillStyle = "#ddd";
    geometry.shape.draw(context, "fill");
  });
}
```

There's a fair amount going on here, too. I'll go through it bit by bit:

```ts
import {
  useType,
  useNewComponent,
  Geometry,
  Polygon,
  Point,
  Physics,
  useDraw,
} from "@hex-engine/2d";
```

First we import a bunch of stuff we're going to use:

- [`useType`](/docs/api-core#usetypecomponentfunction-function-void) is a function we have to call inside every Component function we make.
- [`useNewComponent`](/docs/api-core#usenewcomponentcomponentfunction-function-component) is a function we can call to add a new Component to the current Entity.
- [`Geometry`](/docs/api-2d#geometry) is a Component function that defines an Entity's shape and position in the world.
- [`Polygon`](/docs/api-2d#polygon) is a class that can be used to represent a [polygon](https://en.wikipedia.org/wiki/Polygon).
- [`Point`](/docs/api-2d#point) is a class that represents a 2D point in space; it has an `x` property and a `y` property.
- [`Physics`](/docs/api-2d#physicsbody) is an Object with Component functions on it that make Entities behave like real physical objects.
- [`useDraw`](/docs/api-2d#usedraw) is a function we can call that interacts with the [`Canvas`](/docs/api-2d#canvas) on the root Entity, and tells it how to draw the current Entity onto the screen.

Next, we define the `Floor` Component function. As you may have expected, this is the Component function that defines the appearance and behaviour of the gray platform you see in the game.

```ts
// This Floor component receives a Point as its first argument,
// indicating the position where it sould be created.
export default function Floor(position: Point) {
  // We have to call useType as the first thing in every Component function we write.
  useType(Floor);

  // Here, we call `useNewComponent` to add a `Geometry` component to the
  // current Entity.
  //
  // `Geometry` components define the shape of objects, as well as where they are in the world.
  // Each Entity should have at most one `Geometry` component.
  const geometry = useNewComponent(() =>
    Geometry({
      // We define this Entity's shape as a rectangle with width 200 and height 25.
      shape: Polygon.rectangle(new Point(200, 25)),

      // We position this Entity at the position that was passed in to the Floor function.
      // We clone the position `Point` here so that it's safe to mutate.
      position: position.clone(),
    })
  );

  // Next, we call `useNewComponent` to add a `Physics.Body` component to the current Entity.
  // We pass in the geometry component we created earlier, and also set `isStatic` to `true`;
  // this tells the Physics Engine that this Entity should not move around due to physics,
  // but other things should be able to collide into it.
  useNewComponent(() => Physics.Body(geometry, { isStatic: true }));

  // Finally, we call `useDraw` to tell the root Entity's `Canvas` how to render this `Entity`.
  useDraw((context) => {
    // `context` here is a 2D Canvas Rendering Context.

    // We tell the canvas that if it fills anything in, it should do it in a gray color.
    context.fillStyle = "#ddd";

    // We use the `draw` method on the geometry's `shape` property to fill in a rectangle on the screen.
    geometry.shape.draw(context, "fill");
  });
}
```

Try changing some variables in this code to see what happens; if you change the `Point` passed into `Polygon.rectangle`, it'll change the size of the floor. If you change the `context.fillStyle` to a color other than `"#ddd"`, it'll change the color of the floor. If you set `isStatic` to `false`, then the floor will fall down forever when the game starts.

Hopefully this is starting to feel a bit easier to understand. Next, we'll look at the `Box` component to understand how it works.
