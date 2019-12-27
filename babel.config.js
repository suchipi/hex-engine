module.exports = {
  presets: ["@babel/preset-typescript", "@babel/preset-env"],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-nullish-coalescing-operator",
    "@babel/plugin-proposal-optional-chaining",
    [
      "@babel/plugin-transform-react-jsx",
      {
        pragma: "createElement",
        pragmaFrag: "Array",
      },
    ],
  ],
};
