---
title: Hex Engine for React Developers
---

Hex Engine is designed to feel similar to React, but since games and UI are inherently different, they lend themselves to different programming patterns. As such, there are some notable differences between the component model in React and the component model in Hex Engine. These differences are listed in this document, along with rationale for each.

## 1. In Hex Engine, Components don't return markup.

In React, components return markup indicating what to render to the page, and returning markup is how you compose one component within another:

```tsx
import * as React from "react";
import SomeOtherComponent from "./SomeOtherComponent";
import YetAnotherComponent from "./YetAnotherComponent";

function MyComponent() {
  return (
    <div>
      <SomeOtherComponent />
      <YetAnotherComponent someProp={42} />
    </div>
  );
}
```

This makes sense for React, because markup (what to render to the page) is the most important thing a UI library should give you. You _can_ build components with complex behavior, but many components will only call a few hooks, and render some UI.

In games, however, visuals are just one aspect of the whole experience- Hex Engine components can describe what to render, how to handle gamepad input, when to play sounds, how to respond to physics collisions, and more.

As such, Hex Engine components do _not_ use return values to compose one component inside another. Instead, they use the [`useNewComponent`](/docs/api-core#usenewcomponent) hook:

```ts
import { useType, useNewComponent } from "@hex-engine/core";
import SomeOtherComponent from "./SomeOtherComponent";
import YetAnotherComponent from "./YetAnotherComponent";

function MyComponent() {
  useType(MyComponent);

  useNewComponent(SomeOtherComponent);
  useNewComponent(() => YetAnotherComponent(42));
}
```

> Note: I recognize that JSX markup _can_ be used for non-UI things; it's been used for music creation, for example. However, in my experience, using it for games can be a bit awkward.

## 2. In Hex Engine, Components don't have props; they have parameters.

In React, every Component receives an object of "props" when it's rendered:

```tsx
import * as React from "react";

type Props = {
  something: string;
  somethingElse: number;
};
function MyComponent(props: Props) {
  props.something;
  props.somethingElse;
}
```

These correspond directly to the named JSX attributes that the component element is created with:

```tsx
<SomeComponent /> // Component with no props
<MyComponent something="hello" somethingElse={42} /> // Component with props
```

However, in Hex Engine, this is not the case. Instead of receiving all inputs via one props object, inputs are received as function parameters:

```ts
import { useType } from "@hex-engine/core";

function MyComponent(something: string, somethingElse: number) {
  useType(MyComponent);

  something;
  somethingElse;
}
```

These parameters correspond to the arguments the component is called with:

```ts
useNewComponent(SomeComponent); // Component with no arguments
useNewComponent(() => MyComponent("hello", 42)); // Component with arguments
```

There are a few reasons I did this differently from React:

- React uses JSX, so it _has_ to use named inputs, since you can't have unnamed JSX Attributes. Since Hex Engine isn't using JSX, that constraint doesn't apply.
- React was created before JavaScript type systems were common, so using named arguments 100% of the time and positional arguments 0% of the time was a boon; you never had to remember the order of arguments. However, Hex Engine is being built from the ground up with TypeScript in mind, and TypeScript and Visual Studio Code's powerful Intellisense mean that you don't _need_ to remember the order of positional arguments, because you'll be notified if you got it wrong.

However, the most important reason is this: **Hex Engine is designed with users who are new to TypeScript in mind, and type annotations for destructured object parameters are not intuitive.**

When you want to make a function in JavaScript, you often write it in this order:

- The `function` keyword
- The name of the function
- The first parameter for the function
- The second parameter for the function
- And so on, for all the parameters
- The function body

That looks like this:

```js
function MyComponent(something, somethingElse) {
  // ...
}
```

When you do it in TypeScript, it's intuitive to do things in the same order, just adding parameter annotations as you go along:

- The `function` keyword
- The name of the function
- The first parameter for the function, and its type annotation
- The second parameter for the function, and its type annotation
- And so on, for all the parameters
- The function body

That looks like this:

```js
function MyComponent(something: string, somethingElse: number) {
  // ...
}
```

This is consistent with the thought process one goes through when writing a function or method in a language like C#, Java, Rust, C, C++, or pretty much any other natively-typed language.

When using an object to emulate named parameters, if you consider that object to be one parameter, then this thought process still works:

- The `function` keyword
- The name of the function
- The single parameter for the function, named `props`
- The type annotation for the `props` parameter
- The function body

That looks like this:

```tsx
function MyComponent(props: { something: string; somethingElse: number }) {
  // ...
}
```

However, conceptually, **`props` is not really one parameter; it's all of them.**

Because of this, you may want to use destructuring to write `props`; this is what that looks like in JavaScript:

```js
function MyComponent({ something, somethingElse }) {
  // ...
}
```

This allows you to treat `something` and `somethingElse` like "parameters", even though they are really properties on the first parameter passed to the function.

When you try to do this in TypeScript, though, you quickly notice a problem- you can't annotate your types until you're done writing all your "named parameters":

```ts
// This doesn't annotate the types, it changes the names of the variables:
function MyComponent({ something: string, somethingElse: number }) {
  // ...
}
```

Instead, you have to annotate the "named parameters" after writing _all_ of them:

```ts
function MyComponent({
  something,
  somethingElse,
}: {
  something: string;
  somethingElse: number;
}) {
  // ...
}
```

This breaks the flow that users are used to when writing functions; they now have to write things like this:

- The `function` keyword
- The name of the function
- The first parameter, and remember what its type is, for later
- The second parameter, and remember what its type is, for later
- And so on, trying to remember all the parameters in your head
- Now, all the parameters again, but this time, with their type annotations
- The function body

Speaking from personal experience, this is really annoying.

Also, for TypeScript beginners, the syntax for a function with destructuring assignment in the first parameter and inline type annotations can be really confusing:

```ts
function MyComponent({
  something,
  somethingElse,
}: {
  something: string;
  somethingElse: number;
}) {
  // ...
}
```

There are _three_ kinds of curly braces in just this declaration:

```ts
function MyComponent(
  {
    // This curly brace is opening the destructuring assignment
    something,
    somethingElse,
  }: /* and this curly brace closes it */ {
    // and then *this* curly brace opens the type annotation object type
    something: string;
    somethingElse: number;
  } /* and then this curly brace closes it */
) {
  // and then *this* curly brace opens the function body
  // ...
}
```

You can make it a bit easier to understand by pulling the type annotation out into a type declaration, instead of it being inline:

```ts
type MyComponentParams = {
  something: string;
  somethingElse: number;
};

function MyComponent({ something, somethingElse }: MyComponentParams) {
  // ...
}
```

But that still breaks the flow for writing a function:

- The `function` keyword
- The name of the function
- The first parameter, and remember what its type is, for later
- The second parameter, and remember what its type is, for later
- And so on, trying to remember all the parameters in your head
- Okay, now back up out of the function and write a type for its parameters
- Gotta think of a name...
- Wait, I forgot all the parameter types while thinking of a name
- Okay there, that's good enough
- Now go back into the function declaration and annotate the destructured object
- _Now_ you can write the function body

Ultimately, _requiring_ users to use this pattern to declare function parameters has a lot of downsides.

That's why you can use positional arguments in Hex Engine.

> Note: All this said, there are situations where the emulated-named-parameters pattern is worth doing, because it makes it easier to use your component. In particular, in situations where there are many parameters, or some are optional.
>
> As such, you still _can_ use the one-input-object-that-gets-destructured pattern in Hex Engine- it's just not _required_.

## 3. In Hex Engine, Component functions only run _once_ per instance.

React's rendering model works like this:

- Run the function for the root component, and see what it returns.
- Run the functions for the components it returned, and see what they returned.
- And so on, until everything has been rendered.
- Then, later, when a change occurs (due to component state, for instance):
- Re-run the functions for the affected components, and see what they returned.
- Re-run the functions for the those return values.
- And so on, until everything has re-run.
- Then, _diff_ the results of this render with the results of the last render, to find what's changed.
- Update the underlying DOM nodes or native views to reflect the found changes.

As you can see, component functions can get run more than once, over and over. This is what makes React able to be so declarative and time-independent.

Part of the reason it can accomplish this, is because all the instructions for how the computer should draw the webpage or app are stored in the underlying DOM nodes or native views. React can effectively wake up, change a few things, and then stop running, and the underlying web browser or native view technology will make sure that everything in the DOM or View hierarchy is drawn every frame.

In Hex Engine, though, it's different.

In order to provide the flexibility needed to make games, there's no builtin rectangle-layout-based-structure for all your visual content, like you would get with the DOM or a View hierarchy; instead, _you_ define how each thing gets drawn every frame.

In [`@hex-engine/2d`](/docs/api-2d), the API that is exposed to configure this is [`useDraw`](/docs/api-2d#usedraw):

```ts
import { useType, useDraw } from "@hex-engine/2d";

function MyComponent() {
  let color = "red";

  useDraw((context) => {
    context.strokeStyle = color;
    context.strokeRect(0, 0, 100, 100);
  });
}
```

Every frame, [`@hex-engine/2d`](/docs/api-2d) will draw the background color for the canvas, then call the functions that components passed into `useDraw`, [in order](/docs/api-2d#canvasdraworder).

Said in other words, your `useDraw` function will get called _every frame_.

With that in mind, a lot of React's rendering model doesn't make sense for Hex Engine:

- We need to draw every frame no matter what; we can't go to sleep and wake back up later when a change happens.
- A diff wouldn't help us, since we're going to draw _everything_ on every frame anyway.

Because of that, **there's no reason to call Hex Engine Component functions more than once**- we only need to call the functions they pass into `useDraw` (and `useUpdate`) more than once.

So, Hex Engine only calls your actual Component function once per Component instance: at creation time.

To demonstrate that, here's some code with `console.log`s in it, and the log messages it would generate:

```ts
import { useType, useDraw } from "@hex-engine/2d";

function MyComponent() {
  console.log("In MyComponent");

  useDraw((context) => {
    console.log("In useDraw callback");
  });
}
```

Log output, assuming this component function gets used somewhere:

```
In MyComponent
In useDraw callback
In useDraw callback
In useDraw callback
In useDraw callback
In useDraw callback
...and so on
```

---

There are a few other differences between Hex Engine and React (they're completely different things, after all), but I think these are the most important differences to understand.
