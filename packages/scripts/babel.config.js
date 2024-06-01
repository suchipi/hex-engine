module.exports = {
  presets: [
    "@babel/preset-typescript",
    [
      "@babel/preset-env",
      {
        modules: "commonjs",
        // https://browsersl.ist/#q=defaults%0A
        targets: "defaults",
      },
    ],
    "@babel/preset-react",
  ],
};
