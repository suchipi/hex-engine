---
title: Tic Tac Toe Example
---

In this guide, we'll learn how to create a simple Tic Tac Toe game using Hex Engine.

## Setup

Firstly, we'll want to create a new Hex Engine project. To do this, we'll use a handy tool called `create-hex-engine-game`:

```shell
npx create-hex-engine-game@latest tic-tac-toe
```

All of our work will take place within the newly created `tic-tac-toe/` directory. Now that the project is setup, let's spin up the development environment.

```shell
cd tic-tac-toe
npm start
```

`create-hex-engine` has set us up with a basic game already. Head on over to [http://localhost:8080](http://localhost:8080) to check it out! Once you're done, we can proceed by deleting the default files in `src/`.

```shell
rm src/*
```

## Create The Root Component

Each game in Hex Engine has a Root Entity. To create this, we'll make two files.

1. Firstly, we'll create an `index.ts` file to import our Root Component and instantiate our game.

```ts
// src/index.ts
import { createRoot } from "@hex-engine/2d";
import Root from "./Root";

createRoot(Root)
```

2. Next, we'll create the Root component that creates and sets up a canvas to render the game into.

```ts
// src/Root.ts
import {
  useType,
  useNewComponent,
  Canvas,
} from "@hex-engine/2d";

export default function Root() {
  useType(Root);

  const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
  canvas.fullscreen();
}
```

You should now see a blank canvas and the Hex Engine inspector in the browser!

In our root, we've made use of a few different parts of Hex Engine.

- [`useType`](/docs/api-core#usetype) is used in every component so they can be retrieved later with functions like [`Entity#getComponent`](/docs/api-core#getcomponent).
- [`useNewComponent`](/docs/api-core#usenewcomponent) is used to create a new [`Component`](/docs/api-core#component) instance and attach it to the current [entity](/docs/api-core#entity) (the root Entity in our case).
- [`Canvas`](/docs/api-2d#canvas) creates a new Canvas component that will render the things in our game.

## Create The Cell Component

The Tic Tac Toe board is made up of 9 individual cells. Here we'll make a reusable `Cell` component in the file `src/Cell.ts`.

```ts
// src/Cell.ts
import {
  useType,
  useNewComponent,
  useDraw,
  Geometry,
  Polygon,
} from "@hex-engine/2d";

export default function Cell({ size, position }) {
  useType(Cell);

  useNewComponent(() =>
    Geometry({
      shape: Polygon.rectangle(size),
      position
    })
  );

  useDraw(context => {
    context.lineWidth = 1;
    context.strokeStyle = "black";
    context.strokeRect(0, 0, size.x, size.y);
  });
}
```

This component uses a few new concepts.

- [`Geometry`](/docs/api-2d#geometry) creates a new geometry component for our cell. We'll use this to place and size the cell.
- [`Polygon.rectangle`](/docs/api-2d#polygon) creates a new rectangular polygon that our `Geometry` component uses to set its width and height.
- [`useDraw`](/docs/api-2d#usedraw) will run a function once each frame, passing it the drawing context from our canvas. Here we use it to apply a stroke around our cell.

## Drawing The Grid

With the `Cell` component created, we can start drawing a grid. Modify our `src/Root.ts` file with the following.

> Throughout the rest of this guide, a special comment `/* ...snip... */` will be used in code examples to indicate that there is some other code in that file already, that isn't being shown, so that it's clear what code is being added. You don't need to put the `/* ...snip... */` comment in your code.

```ts
// src/Root.ts
import {
  /* ...snip... */
  // New imports
  Grid,
  Vector,
  useChild,
} from "@hex-engine/2d";

// Import the Cell component
import Cell from "./Cell";

export default function Root() {
  /* ...snip... */
  const grid = new Grid(3, 3, " ");

  const cellSize = new Vector(16, 16);
  const firstCellPosition = new Vector(100, 100);

  for (const [rowIndex, columnIndex] of grid.contents()) {
    useChild(() =>
      Cell({
        size: cellSize,
        position: firstCellPosition
          .addX(cellSize.x * rowIndex)
          .addY(cellSize.y * columnIndex),
      })
    )
  }
}
```

You should now see the board rendering in your browser! Here's the rundown on the new things we used.

- [`Grid`](/docs/api-2d#grid) creates a simple grid object. Here we make a 3x3 grid where each cell has the value `" "`. This value will be changed later to either `"x"` or `"o"` to print in the Cell component.
- [`Vector`](/docs/api-2d#vector) creates a simple 2d Vector object with `x` and `y` properties.
- [`useChild`](/docs/api-core#usechild) allows us to create a new Entity as a child of the current Entity, and create a new Component on that new Entity. Here, we create Entities with `Cell` components as children of our `Root` component.

## Printing Cell Values

Now that the grid is rendering cells, let's pass them the correct text to render. Since the content in the cells will change outside of the Cell component's scope, we'll supply a callback that can be used to get the text to show.

```ts
// src/Root.ts
/* ...snip... */
export default function Root() {
  /* ...snip... */
  for (const [rowIndex, columnIndex] of grid.contents()) {
    useChild(() =>
      Cell({
        /* ...snip... */
        // Here is the new argument we are adding
        getContent: () => grid.get(rowIndex, columnIndex),
      })
    )
  }
}
```

Now let's update the `Cell` component to print the text.

```ts
// src/Cell.ts
import {
  /* ...snip... */
  // New imports
  SystemFont,
  Label,
} from "@hex-engine/2d";

export default function Cell({
  /* ...snip... */
  // Destructure our new parameter
  getContent,
}) {
  /* ...snip... */

  const font = useNewComponent(() =>
    SystemFont({ name: "sans-serif", size: size.y })
  );

  const label = useNewComponent(() => Label({ font }));

  useDraw(context => {
    /* ...snip... */

    // Get and render the latest text
    label.text = getContent();
    label.draw(context);
  });
}
```

To test that this is working, you can try setting the default cell value in the grid to a character other than a space. For example, you could change it to `new Grid(3, 3, "x")`. If you do, don't forget to change it back to `new Grid(3, 3, " ")`!

To render text, we made use of two new components.

- [`SystemFont`](/docs/api-2d#systemfont) creates a Font component that lets us render text in a font available on the user's machine.
- [`Label`](/docs/api-2d#label) creates a Label component that can render text onto the canvas. To render the text, we call `label.draw(context)` each frame in our `useDraw` hook.

## Handling Input

Now that the `Cell` component can render its value in the grid, let's allow the user to start placing 'x's and 'o's! To do so, we'll pass an `onClick` handler to the `Cell` component that will modify the game state when a user clicks on a cell.

```ts
// src/Root.ts
/* ...snip... */

export default function Root() {
  /* ...snip... */
  const grid = new Grid<string>(3, 3, " ");

  // This is the current state of the game
  let state = "PLACING_X";

  for (const [rowIndex, columnIndex] of grid.contents()) {
    useChild(() =>
      Cell({
        /* ...snip... */
        // This is the new handler we are adding
        onClick: () => {
          switch (state) {
            case "PLACING_X": {
              const content = grid.get(rowIndex, columnIndex);
              if (content === " ") {
                grid.set(rowIndex, columnIndex, "x");
                state = "PLACING_O";
              }
              break;
            }
            case "PLACING_O": {
              const content = grid.get(rowIndex, columnIndex);
              if (content === " ") {
                grid.set(rowIndex, columnIndex, "o");
                state = "PLACING_X";
              }
              break;
            }
          }
        },
      })
    );
  }
}
```

And now to listen for clicks in each cell.

```ts
// src/Cell.ts
import {
  /* ...snip... */
  // New imports
  Mouse,
} from "@hex-engine/2d";

export default function Cell({
  /* ...snip... */
  // Destructure our new argument
  onClick,
}) {
  /* ...snip... */

  const mouse = useNewComponent(Mouse);
  mouse.onClick(onClick);
}
```

Clicking on empty cells will now turn them into either an `"x"` or an `"o"`!

This time, the only new component we used was `Mouse`.

- [`Mouse`](/docs/api-2d#mouse) lets us listen to mouse events and get information about position and collision.

## Printing The State

Let's use our `SystemFont` and `Label` skills to print out the current state of the game.

```ts
// src/Root.ts
import {
  /* ...snip... */
  // New imports
  useDraw,
  SystemFont,
  Label,
} from "@hex-engine/2d";

export default function Root() {
  /* ...snip... */

  // Create the font
  const font = useNewComponent(() =>
    SystemFont({ name: "sans-serif", size: 14 })
  );
  // Create the label
  const stateLabel = useNewComponent(() => Label({ font }));

  // Render the label on each frame
  useDraw(context => {
    switch (state) {
      case "PLACING_X": {
        stateLabel.text = "X's turn";
        break;
      }
      case "PLACING_O": {
        stateLabel.text = "O's turn";
        break;
      }
      case "X_WON": {
        stateLabel.text = "X won";
        break;
      }
      case "O_WON": {
        stateLabel.text = "O won";
        break;
      }
      case "TIE": {
        stateLabel.text = "Tie game";
        break;
      }
    }

    stateLabel.draw(context);
  });
}
```

Just like before, we create a `SystemFont` resource and a `Label` component. Then with the `useDraw` hook, we draw the label on every frame. You should now see the game state printed out in the browser!

## Checking Win Conditions

Now that we can see what is happening in the game, let's check to see if one of the players won after each move.

```ts
// src/Root.ts
/* ...snip... */
export default function Root() {
  /* ...snip... */
  let state = "PLACING_X";

  // This function checks the grid to see if one of the players won (or tied)
  function checkForWinCondition() {
    for (const [rowIndex, columnIndex, value] of grid.contents()) {
      if (value === "x" || value === "o") {
        const up = grid.get(rowIndex - 1, columnIndex);
        const down = grid.get(rowIndex + 1, columnIndex);

        const left = grid.get(rowIndex, columnIndex - 1);
        const right = grid.get(rowIndex, columnIndex + 1);

        const upLeft = grid.get(rowIndex - 1, columnIndex - 1);
        const upRight = grid.get(rowIndex - 1, columnIndex + 1);

        const downLeft = grid.get(rowIndex + 1, columnIndex - 1);
        const downRight = grid.get(rowIndex + 1, columnIndex + 1);

        if (
          (up === value && down === value) ||
          (left === value && right === value) ||
          (upLeft === value && downRight === value) ||
          (upRight === value && downLeft === value)
        ) {
          state = value === "x" ? "X_WON" : "O_WON";
        }
      }
    }

    const allCells = [...grid.contents()].map(([row, column, value]) => value);
    if (
      allCells.every(value => value !== " ") &&
      state !== "X_WON" &&
      state !== "O_WON"
    ) {
      state = "TIE";
    }
  }

  for (const [rowIndex, columnIndex] of grid.contents()) {
    useChild(() =>
      Cell({
        /* ...snip... */
        onClick: () => {
          switch (state) {
            /* ...snip... */
          }

          // Check for a win condition after each move
          checkForWinCondition();
        }
      })
    );
  }
}
```

That's it! Head on over to your browser and challenge your best friend to a game of Tic Tac Toe!
