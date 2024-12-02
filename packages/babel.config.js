module.exports = {
  plugins: [
    [
      "@babel/plugin-transform-react-jsx",
      {
        pragma: "createElement",
        pragmaFrag: "Fragment",
      },
    ],
  ],
};
