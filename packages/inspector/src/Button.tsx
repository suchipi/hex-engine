import React from "preact/compat";

const baseStyle: React.JSX.CSSProperties = {
  fontFamily: "inherit",
  fontSize: "inherit",
  backgroundColor: "transparent",
  border: "none",
  padding: "0",
  margin: "0",
  textAlign: "left",
  cursor: "pointer",
};

export default function Button(props: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      style={props.style ? Object.assign(baseStyle, props.style) : baseStyle}
    />
  );
}
