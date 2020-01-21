![Hex Engine Logo](logo-image.png)

---

⚠️ **WORK IN PROGRESS** ⚠️

Hex Engine is a 2D Game Engine for the browser, written in TypeScript. It is designed to feel similar to [React](https://reactjs.org/).

Hex Engine implements a variant of the popular [Entity-Component-System model](https://en.wikipedia.org/wiki/Entity_component_system), adapting it to make Components radically composable. In Hex Engine, every Component is a function, and Components can call special Hook functions to define their behavior in the game engine.

Hex Engine comes out-of-the-box with a powerful inspector and a modern frontend code compilation pipeline.

Hex Engine is inspired by [React](https://reactjs.org/), [Impact](https://impactjs.com/), [Unity](https://unity.com/), and [LÖVE](https://love2d.org/).

Here's an example of what code looks like in Hex Engine.

```ts
import {
  useDraw,
  useUpdate,
  useNewComponent,
  SystemFont,
  Label
} from "@hex-engine/2d";

export default MyComponent() {
  const font = useNewComponent(() =>
    SystemFont({ name: "Arial", size: 12 })
  );
  const label = useNewComponent(() => Label({ font }));

  let elapsedTime = 0;
  useUpdate((delta) => {
    elapsedTime += delta;

    label.text = `Elapsed time: ${elapsedTime}`;
  });

  useDraw((context) => {
    label.draw(context, { x: 10, y: 10 });
  });
}
```
