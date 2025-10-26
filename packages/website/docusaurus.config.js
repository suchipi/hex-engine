// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

module.exports = {
  title: "Hex Engine",
  tagline: "A Modern 2D Game Engine for the Browser",
  url: "https://hex-engine.dev/",
  baseUrl: "/",
  favicon: "favicon.ico",
  trailingSlash: false,

  organizationName: "suchipi",
  projectName: "hex-engine",

  scripts: [],
  stylesheets: [],

  themeConfig: {
    footer: {
      copyright: `Copyright © 2020 - ${new Date().getFullYear()} Lily Skye`,
    },

    navbar: {
      title: "Hex Engine",
      logo: {
        alt: "Hex Engine logo",
        src: "img/hex.png",
      },
      items: [
        { to: "docs/getting-started", label: "Docs", position: "left" },
        { to: "docs/api-reference", label: "API", position: "left" },
        { to: "docs/examples", label: "Examples", position: "left" },
        { to: "docs/guides", label: "Guides", position: "left" },
        // { to: "blog", label: "Blog", position: "left" },
        {
          to: "https://github.com/suchipi/hex-engine",
          label: "GitHub",
          position: "right",
          target: "_blank",
        },
        {
          to: "https://discord.gg/afFkpC9",
          label: "Discord",
          position: "right",
          target: "_blank",
        },
      ],
    },

    algolia: {
      appId: "Q9XGV9R56F",
      apiKey: "3d7810edc3f8e62e8f4bd29c2a06a284",
      indexName: "hex-engine",
    },

    // meta tag
    image: "img/hex.png",
  },

  presets: [
    [
      "@docusaurus/preset-classic",
      {
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },

        docs: {
          // docs folder path relative to website dir.
          path: "./docs",
          // sidebars file relative to website dir.
          sidebarPath: require.resolve("./sidebars.json"),
        },
      },
    ],
  ],
};
