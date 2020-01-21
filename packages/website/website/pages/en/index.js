const React = require("react");
const dedent = require("dedent");

// ??? This must magically point to some internal docusaurus thing...
const CompLibrary = require("../../core/CompLibrary.js");

const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

class HomeSplash extends React.Component {
  render() {
    const { siteConfig, language = "" } = this.props;
    const { baseUrl, docsUrl } = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ""}`;
    const langPart = `${language ? `${language}/` : ""}`;
    const docUrl = (doc) => `${baseUrl}${docsPart}${langPart}${doc}`;

    const SplashContainer = (props) => (
      <div
        className="homeContainer"
        style={{
          backgroundColor: "#f3d6ff",
        }}
      >
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    );

    const Logo = (props) => (
      <div className="projectLogo">
        <img src={props.img_src} alt="Project Logo" />
      </div>
    );

    const ProjectTitle = (props) => (
      <h2 className="projectTitle">
        {props.title}
        <small>{props.tagline}</small>
      </h2>
    );

    const PromoSection = (props) => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    );

    const Button = (props) => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );

    return (
      <SplashContainer>
        <Logo img_src={`${baseUrl}img/hex.png`} />
        <div className="inner">
          <ProjectTitle tagline={siteConfig.tagline} title={siteConfig.title} />
          <PromoSection>
            <Button href={`${baseUrl}docs/getting-started`}>Get Started</Button>{" "}
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

class Index extends React.Component {
  render() {
    const { config: siteConfig, language = "" } = this.props;
    const { baseUrl } = siteConfig;

    const Block = (props) => (
      <Container
        padding={["bottom", "top"]}
        id={props.id}
        background={props.background}
      >
        <GridBlock
          align="left"
          contents={props.children}
          layout={props.layout}
        />
      </Container>
    );

    const Composable = () => (
      <Block background="light">
        {[
          {
            image: `${baseUrl}img/undraw_fitting_pieces.svg`,
            title: "Composable",
            content: dedent`
              Hex Engine's design encourages composable, re-usable, flexible code.

              Written some game logic and decided that you want to re-use it in another Entity?
              No problem, just copy the code out into a function, then pull it in everywhere you
              want it. Since you don't need to conform to rigid class interfaces with Hex Engine,
              you can organize your code however you like- and share it with your friends to use
              in their projects.
              `,
            imageAlign: "right",
          },
        ]}
      </Block>
    );

    const Approachable = () => (
      <Block>
        {[
          {
            image: `${baseUrl}img/undraw_programmer.svg`,
            title: "Approachable",
            content: dedent`
              Hex Engine is both powerful *and* easy to get started with.

              You'll find everything you need out of the box to make simple 2D games-
              a physics engine, asset loading, rendering, input handling, and so on. But
              for anything you need that's not built into the engine, Hex Engine provides
              you with the same tools it's built out of to make your own additions.
              Plus, thanks to the first-class TypeScript support, your editor will
              help you understand what each piece of Hex Engine does.
            `,
            imageAlign: "left",
          },
        ]}
      </Block>
    );

    const WorksWithYourTools = () => (
      <Block background="dark">
        {[
          {
            image: `${baseUrl}img/undraw_designer_life.svg`,
            title: "Works With Your Tools",
            content: dedent`
              Hex Engine understands that your team has an existing workflow-
              that's why it has has built-in first-class support for industry-proven tools
              such as [Aseprite](https://www.aseprite.org/),
              [Tiled](https://www.mapeditor.org/),
              and [AngelCode BMFont](https://www.angelcode.com/products/bmfont/). Just \`import\`
              your asset files the same way you would your code.
            `,
            imageAlign: "right",
          },
        ]}
      </Block>
    );

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <Composable />
        <Approachable />
        <WorksWithYourTools />
      </div>
    );
  }
}

module.exports = Index;
