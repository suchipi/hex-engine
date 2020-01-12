import { useType } from "@hex-engine/core";
import { FontImplementation } from "./Font";
import { Vec2 } from "../Models";

export default function TextBox({
  font,
  size,
  lineHeight: receivedLineHeight,
}: {
  font: FontImplementation;
  size: Vec2;
  lineHeight?: number;
}) {
  useType(TextBox);

  return {
    drawText({
      context,
      text,
      x = 0,
      y = 0,
    }: {
      context: CanvasRenderingContext2D;
      text: string;
      x?: number;
      y?: number;
    }) {
      if (!font.readyToDraw()) return;

      context.fillStyle = "red";
      context.fillRect(x, y, size.x, size.y);

      let lineHeight = receivedLineHeight!;
      if (lineHeight == null) {
        const metrics = font.measureText("hi");
        lineHeight = (metrics.height + metrics.descender) * 1.25;
      }

      const words = text
        .replace(/\n/g, " _-_LINE_BREAK_-_ ")
        .replace(/\t/g, " _-_TAB_-_ ")
        .split(/ /);

      const lines: Array<string> = [];

      while (words.length > 0 && (lines.length + 1) * lineHeight < size.y) {
        let widthSoFarOnLine = 0;
        let line = "";
        while (words.length > 0 && widthSoFarOnLine < size.x) {
          let word = words.shift()!;
          if (word === "_-_LINE_BREAK_-_") {
            break;
          }
          if (word === "_-_TAB_-_") {
            word = "    ";
          }

          const addition = line ? " " + word : word;
          const additionWidth = font.measureText(addition).width;
          if (widthSoFarOnLine + additionWidth < size.x) {
            line += addition;
            widthSoFarOnLine += additionWidth;
          } else {
            words.unshift(word);
            break;
          }
        }
        lines.push(line);
      }

      lines.forEach((line, index) => {
        const lineOffset = lineHeight * index;
        font.drawText({ context, text: line, x, y: y + lineOffset });
      });
    },
  };
}
