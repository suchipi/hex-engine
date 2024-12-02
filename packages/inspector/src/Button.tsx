import { createElement, ComponentProps } from "preact";

export default function Button(
  props: Omit<ComponentProps<"button">, "style"> & {
    style?: Partial<createElement.JSX.CSSProperties>;
  }
) {
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
