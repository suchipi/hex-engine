import React from "inferno-compat";

const baseStyle: import("csstype").PropertiesHyphen = {
  "font-family": "inherit",
  "font-size": "inherit",
  "background-color": "transparent",
  border: "none",
  padding: "0",
  margin: "0",
  "text-align": "left",
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
