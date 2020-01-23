![Hex Engine Logo](logo-image.png)

---

⚠️ **WORK IN PROGRESS** ⚠️

Hex Engine is a 2D Game Engine for the browser, written in TypeScript. It is designed to feel similar to [React](https://reactjs.org/).

Hex Engine implements a variant of the popular [Entity-Component-System model](https://en.wikipedia.org/wiki/Entity_component_system), adapting it to make Components radically composable. In Hex Engine, every Component is a function, and Components can call special Hook functions to define their behavior in the game engine.

Hex Engine comes out-of-the-box with a powerful development inspector and a modern frontend code compilation pipeline.

Out of the box, Hex Engine has:

- 2D rendering via HTML5 Canvas
- Support for sprite sheets and animations
- Helpers for sound playback and synthesization
- Physics (via [matter.js](https://brm.io/matter-js/))
- Mouse, Keyboard, and Gamepad input
- First-class support for popular indie game development tools [Aseprite](https://www.aseprite.org/), [Tiled](https://www.mapeditor.org/), and [BMFont](https://www.angelcode.com/products/bmfont/)
- And much, much, more

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

Hex Engine was created by yours truly, Lily Scott. I am known throughout the JavaScript Open-Source community as one of the core maintainers of [Prettier](https://prettier.io/), and I have also contributed to a myriad of other well-known projects, including [Babel](https://babeljs.io/) and [React DevTools](https://github.com/facebook/react-devtools).

I built Hex Engine because I felt that the browser game engine space could benefit a lot from technologies and patterns found in the open-source JavaScript frontend and tooling communities.

It is the culmination of years of research, and probably the fifth or sixth game engine I have written for the browser (but the first that I've been proud enough of to share).

Interested? Check out [Hex Engine's homepage](https://hex-engine.dev) for installation and usage instructions.

---

Logo Font is [Silver by Poppy Works](https://poppyworks.itch.io/silver).
