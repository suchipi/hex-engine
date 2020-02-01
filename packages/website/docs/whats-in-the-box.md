---
title: What's in the Box?
---

Go ahead and open up `src/Box.ts`.

```ts
// src/Box.ts
import {
  useType,
  useNewComponent,
  Geometry,
  Polygon,
  Vector,
  Physics,
  useDraw,
} from "@hex-engine/2d";
import Draggable from "./Draggable";

export default function Box(position: Vector) {
  useType(Box);

  const geometry = useNewComponent(() =>
    Geometry({
      shape: Polygon.rectangle(new Vector(25, 25)),
      position: position.clone(),
    })
  );

  useNewComponent(() => Physics.Body(geometry));
  useNewComponent(() => Draggable(geometry));

  useDraw((context) => {
    context.fillStyle = "red";
    geometry.shape.draw(context, "fill");
  });
}
```

Wow, this looks almost _exactly_ the same as `src/Floor.ts`. The only real different parts are:

- When we create the Physics.Body, we _don't_ set `isStatic`. This means that it will be `false`, so the Box will fall due to gravity.
- There's some kind of "Draggable" Component here?

Hmmm... without digging into it, I bet that `Draggable` Component is what makes the Box move around when you click and drag on it.

Do you think we could put that `Draggable` component on the Floor, as well?

Let's give it a try!
