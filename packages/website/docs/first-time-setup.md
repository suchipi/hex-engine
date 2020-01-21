---
title: First Time Setup
sidebar_label: First Time Setup
---

To quickly scaffold out a template game using Hex Engine, you can use the npm package `create-hex-engine-game`. Pick a directory where you want to make your game, then run the following in a terminal emulator or command prompt:

```
npx create-hex-engine-game my-game
```

You can change `my-game` to whatever you want; that's the name of the folder where it's going to put everything.

It will run some tasks, and then let you know when it's done. Once it is, go open up that `my-game` directory (or whatever else you named it- for the rest of this tutorial, we'll assume you named it `my-game`, though).

Inside the directory, you'll see a structure like this:

```
my-game
├── README.md
├── package.json
└── src
    ├── Box.ts
    ├── Draggable.ts
    ├── Floor.ts
    ├── Root.ts
    └── index.ts
```

You may notice those `.ts` files- these are [TypeScript](https://www.typescriptlang.org/) files.
If you're not familiar with TypeScript, don't worry! TypeScript usage in Hex Engine is _entirely optional_. That said, it's also _highly recommended_. Hex Engine's API has been designed to make your TypeScript exposure **as little and as painless as possible**. However, if you prefer to use plain JavaScript instead of TypeScript, you can rename these files so they end with `.js`, and then remove the TypeScript-specific type annotations from them.

Before we dig into the code, let's start up a local development server and see what we have so far in the browser. To do so, use a terminal emulator or command prompt to `cd` to your project directory (`my-game`, unless you changed it), then run this command within:

```
npm start
```

This will start a local web server running on your computer that you can use to develop your game. To connect to it, open up your browser to <http://localhost:8080>.

When you do, you'll see something like this:
