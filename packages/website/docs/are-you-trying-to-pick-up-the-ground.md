---
title: Are You Trying To Pick Up The Ground?
---

Let's open up `src/Floor.ts` again, and add the `Draggable` Component to the Floor.

We're going to need to first import the `Draggable` Component:

```ts
import Draggable from "./Draggable";
```

And then add it to the current Entity by using `useNewComponent`:

```ts
useNewComponent(() => Draggable(geometry));
```

Once you've done both of those things, `src/Floor.ts` should look like this:

```ts
import {
  useType,
  useNewComponent,
  Geometry,
  Polygon,
  Vector,
  Physics,
  useDraw,
} from "@hex-engine/2d";
import Draggable from "./Draggable"; // Added this line

export default function Floor(position: Vector) {
  useType(Floor);

  const geometry = useNewComponent(() =>
    Geometry({
      shape: Polygon.rectangle(new Vector(200, 25)),
      position: position.clone(),
    })
  );

  useNewComponent(() => Physics.Body(geometry, { isStatic: true }));
  useNewComponent(() => Draggable(geometry)); // Added this line

  useDraw((context) => {
    context.fillStyle = "#ddd";
    geometry.shape.draw(context, "fill");
  });
}
```

Now if you return to your game in the browser... you should be able to drag the floor around. Neat!

Here's some other things you can try:

- Read through `src/Draggable.ts` to understand how it works.
- Try changing `Draggable` so that it only works if you're holding down the Shift key.
- Try creating a button that spawns more Entities with `Box` Components.
- Try making sounds play when objects collide with each other.

This concludes the introductory tutorial. If you're interested in learning more, you can read the [API Documentation](/docs/api-reference).
