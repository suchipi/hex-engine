module.exports = {
  presets: [
    "@babel/preset-typescript",
    [
      "@babel/preset-env",
      {
        modules: "commonjs",
      },
    ],
    "@babel/preset-react",
  ],
  plugins: ["babel-plugin-remove-prev-node"],
};
