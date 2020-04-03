// Override the font family everywhere so that screenshots are consistent
// across mac/linux. Otherwise CI uses a different monospace font than macOS,
// which causes image snapshots to fail, because of the label in the inspector
// bar.
const font = require("./brass-mono-font/BrassMonoRegular-o2Yz.otf");

const style = document.createElement("style");
style.type = "text/css";
style.textContent = `
@font-face {
  font-family: "Brass Mono";
  font-style: normal;
  src: url(${font});
}

* {
	font-family: "Brass Mono" !important;
}
`;

document.head.appendChild(style);
