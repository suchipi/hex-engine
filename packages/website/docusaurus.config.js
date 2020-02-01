// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

module.exports = {
  title: "Hex Engine",
  tagline: "A Modern 2D Game Engine for the Browser",
  url: "https://hex-engine.dev/",
  baseUrl: "/",
  favicon: "favicon.ico",

  organizationName: "suchipi",
  projectName: "hex-engine",

  scripts: [],
  stylesheets: [],

  themeConfig: {
    footer: {
      copyright: `Copyright © ${new Date().getFullYear()} Lily Scott`,
    },

    navbar: {
      title: "Hex Engine",
      logo: {
        alt: "Hex Engine logo",
        src: "img/hex.png",
      },
      links: [
        { to: "docs/getting-started", label: "Docs", position: "left" },
        { to: "docs/api-reference", label: "API", position: "left" },
        { to: "blog", label: "Blog", position: "left" },
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
