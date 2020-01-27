import * as React from "react";
import dedent from "dedent";
import marked from "marked";
// eslint-disable-next-line import/no-unresolved
import Layout from "@theme/Layout";
import siteConfig from "../../docusaurus.config";
const { baseUrl } = siteConfig;

function HomeSplash() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px",
      }}
    >
      <img
        style={{ width: 200, height: 200, margin: "8px" }}
        src={`${baseUrl}img/hex.png`}
      />
      <div style={{ textAlign: "center" }}>
        <h1 style={{ margin: "8px" }}>{siteConfig.title}</h1>
        <div style={{ margin: "8px" }}>{siteConfig.tagline}</div>

        <div style={{ margin: "32px" }}>
          <a className="button" href={`${baseUrl}docs/getting-started`}>
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}

function Index() {
  const Block = (props) => (
    <div
      style={{
        padding: "16px 0",
        backgroundColor: {
          none: "white",
          light: "#ddd",
          dark: "#222",
        }[props.background || "none"],
        color: {
          none: "black",
          light: "black",
          dark: "white",
        }[props.background || "none"],
      }}
    >
      <div
        className="layout-wrapper"
        style={{
          display: "flex",
          maxWidth: 960,
          margin: "0 auto",
          padding: "24px 0",
          alignItems: "center",
        }}
      >
        {props.imageAlign === "left" ? (
          <img
            style={{ width: "450px", maxWidth: "50vw", paddingLeft: "32px" }}
            src={props.image}
          ></img>
        ) : null}
        <div
          style={{
            padding: "32px",
          }}
        >
          <h3>{props.title}</h3>
          <div
            dangerouslySetInnerHTML={{ __html: marked(props.content || "") }}
          />
        </div>
        {props.imageAlign === "right" ? (
          <img
            style={{ width: "450px", maxWidth: "50vw", paddingRight: "32px" }}
            src={props.image}
          ></img>
        ) : null}
      </div>
    </div>
  );

  const README = () => (
    <Block
      background="dark"
      content={dedent`
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

        Hex Engine was created by yours truly, Lily Scott. I am known throughout the JavaScript Open-Source community as one of the core maintainers of [Prettier](https://prettier.io/), and I have also contributed to a myriad of other well-known projects, including [Babel](https://babeljs.io/) and [React DevTools](https://github.com/facebook/react-devtools).

        I built Hex Engine because I felt that the browser game engine space could benefit a lot from technologies and patterns found in the open-source JavaScript frontend and tooling communities.

        It is the culmination of years of research, and probably the fifth or sixth game engine I have written for the browser (but the first that I've been proud enough of to share).

        All that said, it's far from done- I'm hoping that we can form a community together and make something we can all be proud of.

        Interested? Check out the [getting started guide](${baseUrl}docs/getting-started) for installation and usage instructions.
      `}
    />
  );

  // const Composable = () => (
  //   <Block
  //     background="light"
  //     image={`${baseUrl}img/undraw_fitting_pieces.svg`}
  //     title="Composable"
  //     content={dedent`
  //       Hex Engine's design encourages composable, re-usable, flexible code.

  //       Written some game logic and decided that you want to re-use it in another Entity?
  //       No problem, just copy the code out into a function, then \`import\` it everywhere you
  //       want it. Since you don't need to conform to rigid class interfaces with Hex Engine,
  //       you can organize your code however you like- and share it with your friends to use
  //       in their projects.
  //     `}
  //     imageAlign="right"
  //   />
  // );

  // const Approachable = () => (
  //   <Block
  //     image={`${baseUrl}img/undraw_programmer.svg`}
  //     title="Approachable"
  //     content={dedent`
  //       Hex Engine is both powerful *and* easy to get started with.

  //       You'll find everything you need out of the box to make simple 2D games-
  //       a physics engine, asset loading, rendering, input handling, and so on. But
  //       for anything you need that's not built into the engine, Hex Engine provides
  //       you with the same tools it's built out of to make your own additions.
  //       Plus, thanks to the first-class TypeScript support, your editor will
  //       help you understand what each piece of Hex Engine does.
  //     `}
  //     imageAlign="left"
  //   />
  // );

  // const WorksWithYourTools = () => (
  //   <Block
  //     background="dark"
  //     image={`${baseUrl}img/undraw_designer_life.svg`}
  //     title="Works With Your Tools"
  //     content={dedent`
  //             Hex Engine understands that your team has an existing workflow-
  //             that's why it has has built-in first-class support for industry-proven tools
  //             such as [Aseprite](https://www.aseprite.org/),
  //             [Tiled](https://www.mapeditor.org/),
  //             and [AngelCode BMFont](https://www.angelcode.com/products/bmfont/). Just \`import\`
  //             your asset files the same way you would your code.
  //           `}
  //     imageAlign="right"
  //   />
  // );

  return (
    <div>
      <HomeSplash />
      <README />
      {/* <Composable /> */}
      {/* <Approachable /> */}
      {/* <WorksWithYourTools /> */}
    </div>
  );
}

export default function Page() {
  return (
    <Layout title="Hex Engine - A Modern 2D Game Engine for the Browser">
      <Index />
    </Layout>
  );
}
