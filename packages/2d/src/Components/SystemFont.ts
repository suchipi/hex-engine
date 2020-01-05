import { useType, useNewComponent } from "@hex-engine/core";
import Font, { FontImplementation } from "./Font";

export default function SystemFont({
  name,
  size,
  color = "black",
  align = "left",
}: {
  name: string;
  size: string | number;
  color?: void | string;
  align?: void | "start" | "end" | "left" | "right" | "center";
}): FontImplementation {
  useType(SystemFont);

  if (typeof size === "number") {
    size = size + "px";
  }

  const fontString = size + " " + name;

  return useNewComponent(() =>
    Font({
      drawText({ context, text, x = 0, y = 0 }) {
        context.font = fontString;
        context.fillStyle = color;
        context.textAlign = align;
        context.fillText(text, x, y);
      },
      measureTextWidth({ context, text }) {
        const metrics = context.measureText(text);
        return metrics.width;
      },
    })
  );
}
