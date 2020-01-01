import React from "react";

export default function Button(props: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      style={{
        fontFamily: "inherit",
        fontSize: "inherit",
        backgroundColor: "transparent",
        border: "none",
        padding: "0",
        margin: "0",
        textAlign: "left",
        cursor: "pointer",
        ...props.style,
      }}
    />
  );
}
