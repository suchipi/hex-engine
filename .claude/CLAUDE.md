# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Hex Engine is a 2D browser game engine written in TypeScript, structured as an npm-workspaces monorepo. Additional per-path rules live in [.claude/rules/](./rules/).

## Packages

| Folder                                                       | npm name                 | Role                                                                                                 |
| ------------------------------------------------------------ | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| [packages/core](../packages/core/)                           | `@hex-engine/core`       | Entity/Component model, hooks system, run loop, lifecycle events. No rendering.                      |
| [packages/inspector](../packages/inspector/)                 | `@hex-engine/inspector`  | In-game debug UI, written in Inferno (JSX). Depends on core.                                         |
| [packages/2d](../packages/2d/)                               | `@hex-engine/2d`         | The package games actually import. Canvas rendering, physics, input, assets. Re-exports all of core. |
| [packages/scripts](../packages/scripts/)                     | `hex-engine-scripts`     | Webpack/Babel build toolchain + test runner wrapper used by games.                                   |
| [packages/create](../packages/create/)                       | `create-hex-engine-game` | Project scaffolder; ships [template/](../packages/create/template/) and `versions.json`.             |
| [packages/game](../packages/game/)                           | (private)                | Example game, doubles as a manual test bed.                                                          |
| [packages/integration-tests](../packages/integration-tests/) | (private)                | Cross-package behavioral tests (transforms, draw order, Ogmo import).                                |
| [packages/website](../packages/website/)                     | (private)                | Docusaurus site for hex-engine.dev.                                                                  |

## Commands

| Command                       | Notes                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `npm run build`               | [../dev-scripts/build.sh](dev-scripts/build.sh): Babel-compiles each package's `src` to `dist`. Website build is skipped here. |
| `npm start` / `npm run watch` | Watches every package concurrently; example game on port 8080, website on port 3000.                                           |
| `npm run typecheck`           | `tsc --noEmit` over the whole repo. `packages/scripts` and `packages/create/template` are excluded from the root tsconfig.     |
| `npm test`                    | typecheck, then the full test suite.                                                                                           |
| `npm run test-it`             | Tests only. Requires `packages/scripts/dist` to exist, so run `npm run build` first on a fresh clone.                          |
| `npm run build-website`       | Website only (runs inside Docker; `npm run netlify` is the no-Docker variant).                                                 |

Run a single test file by passing your own glob to the same CLI:

```
node ./packages/scripts/dist/cli.js test 'packages/core/src/tests/destroy.test.ts'
```

Append `--watch` to rerun on change, or `-u` to update snapshots (including image snapshots).

### Tests are not headless

Tests run under [Test-It](https://github.com/suchipi/test-it), which drives a real nw.js/Chromium window, and many assert with `expect(await TestIt.captureScreenshot()).toMatchImageSnapshot()`. A window will open when you run them locally. CI runs everything through [in-docker.sh](../in-docker.sh) (`suchipi/node-nw-env` + Xvfb); that script is written in fish and needs Docker, and is the way to reproduce CI results or regenerate image snapshots that must match Linux rendering.

## Architecture

### Components are functions, not classes

`instantiate()` ([packages/core/src/instantiate.ts](../packages/core/src/instantiate.ts)) creates a `Component` instance, binds it as the "current instance" in the hooks system (built on `concubine`), and calls your component function inside that binding. If the function returns an object, `proxyProperties` defines getters/setters for its properties on the Component instance, which is why `entity.getComponent(Foo)` returns both the Component interface and whatever `Foo` returned.

Consequences worth internalizing:

- **`useType(Foo)` is mandatory.** `getComponent`/`hasComponent` key off `component.type`, which only `useType` sets. It also names the Entity. Call it as the first line of every component function.
- **Deferred callbacks must be wrapped.** Hooks resolve against whichever instance is current _at call time_. Any callback stored to run later (event handler, frame callback) has to go through `useCallbackAsCurrent`, or hooks inside it will bind to the wrong component. The built-in hooks already do this.
- **Entities are dumb.** An Entity is a `Set` of Components plus parent/children links. All behavior lives in Components.

### Sharing state: root storage components

The repo-wide idiom for shared/global state is a component that only holds state, memoized onto the root entity:

```ts
const storage =
  useRootEntity().getComponent(StorageForThing) ||
  useNewRootComponent(StorageForThing);
```

Grep for `StorageFor` to find existing ones. This is how `useUpdate`, `useDraw`, `useDestroy`, `useEnableDisable`, and the inspector hooks all work. See [storage-components.md](../packages/website/docs/storage-components.md).

### Frame pipeline

`RunLoop` ([packages/core/src/Components/RunLoop.ts](../packages/core/src/Components/RunLoop.ts)) is the only `requestAnimationFrame` owner. Callbacks registered via `useFrame` go into ordered groups, and [USE_FRAME_GROUP_INDICES](../packages/2d/src/Hooks/USE_FRAME_GROUP_INDICES.ts) is what guarantees all updates run before any draws. `useUpdate` and `useDraw` do not use `useFrame` per component; each registers into a single root-level `UpdateChildren`/`DrawChildren` component that walks the entity tree once per frame. `RunLoop` also exposes `pause`/`step`/`resume`, which the inspector and screenshot tests drive.

### Drawing and transforms

`Canvas` ([packages/2d/src/Canvas/index.ts](../packages/2d/src/Canvas/index.ts)) is the 2d root component: it creates the canvas element, the `RunLoop`, `DrawChildren`, and (outside production) the `Inspector`. `useDraw` transforms the context from the Entity's `Geometry` component (position, rotation, scale, origin) before calling your callback, so callbacks draw in local coordinates; `useRawDraw` gives you the untransformed context. Draw order is computed by `DrawOrder`'s sort and is overridable per-canvas.

### Lifecycle events

[CoreEvents.ts](../packages/core/src/CoreEvents.ts) exports a singleton `events` emitter that fires `BEFORE`/`AFTER` phases around entity/component creation, destruction, enable/disable, and add/remove. This is intentionally separate from the component tree.

### Game build toolchain

[makeWebpackConfig.ts](../packages/scripts/src/makeWebpackConfig.ts) builds a user's game: Babel for TS/JSX, plus loaders for Aseprite, BMFont, Ogmo, and XML assets so games can `import` them directly. In production mode it aliases `@hex-engine/inspector` to a stub so the debug UI is not shipped.

## Conventions and gotchas

- **`types` points at `src`, not `dist`.** Each package's `package.json` sets `"types": "src/index.ts"`. TypeScript resolves cross-package types from source, but Node resolves runtime code from `dist`. So type-level changes are visible to other packages immediately, while behavior changes require rebuilding that package's `dist` (`npm run watch` handles this).
- **Type-only re-exports need a pragma.** In barrel files, a type-only export must be followed by `/* @babel-remove-prev-node */` or the build breaks. See the note in [packages/2d/src/Components/index.ts](../packages/2d/src/Components/index.ts).
- **API docs are hand-maintained.** [api-core.md](../packages/website/docs/api-core.md), [api-2d.md](../packages/website/docs/api-2d.md), and [api-inspector.md](../packages/website/docs/api-inspector.md) are written by hand, not generated. Public API changes need matching doc edits. The Docusaurus build throws on broken anchors and unresolvable relative markdown links, so renaming a heading breaks the build for every link into it.
- **Version bumps are scripted.** `node dev-scripts/bump-versions.js <version>` rewrites every package version and the exact-pinned cross-package dependencies together; `dev-scripts/publish-all.sh` publishes in dependency order.
