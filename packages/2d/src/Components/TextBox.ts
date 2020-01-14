import { useType } from "@hex-engine/core";
import { useInspectorHoverOutline } from "../Hooks";
import { FontImplementation } from "./Font";
import { Vec2 } from "../Models";

const textToTokens = (text: string): Array<string> => {
  return text
    .replace(/\n/g, " _-_LINE_BREAK_-_ ")
    .replace(/\t/g, " _-_TAB_-_ ")
    .split(/ /); // TODO: doesn't work for CJK, where there's no spaces
};

const tokensToText = (tokens: Array<string>): string => {
  return tokens
    .join(" ")
    .replace(/ _-_LINE_BREAK_-_ /g, "\n")
    .replace(/ _-_TAB_-_ /g, "\t");
};

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

  useInspectorHoverOutline(size);

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
      if (!font.readyToDraw())
        return { textFit: false, remainingText: text, printedLines: [] };

      let lineHeight = receivedLineHeight!;
      if (lineHeight == null) {
        const metrics = font.measureText("hi");
        lineHeight = metrics.height + metrics.descender;
      }

      const tokens = textToTokens(text);
      const seenTokens = [];

      const lines: Array<string> = [];

      let textFit = true;
      let remainingText = "";
      while (tokens.length > 0 && (lines.length + 1) * lineHeight < size.y) {
        let widthSoFarOnLine = 0;
        let line = "";
        while (tokens.length > 0 && widthSoFarOnLine < size.x) {
          let token = tokens.shift()!;
          if (token === "_-_LINE_BREAK_-_") {
            seenTokens.push(token);
            break;
          }
          if (token === "_-_TAB_-_") {
            token = "    ";
          }

          const addition = line ? " " + token : token;
          const additionWidth = font.measureText(addition).width;
          if (widthSoFarOnLine + additionWidth < size.x) {
            line += addition;
            widthSoFarOnLine += additionWidth;
            seenTokens.push(token);
          } else {
            tokens.unshift(token);
            break;
          }
        }
        if (tokens.length > 0) {
          textFit = false;
          remainingText = tokensToText(tokens);
        } else {
          textFit = true;
          remainingText = "";
        }

        lines.push(line);
      }

      lines.forEach((line, index) => {
        const lineOffset = lineHeight * index;
        font.drawText({ context, text: line, x, y: y + lineOffset });
      });

      return {
        textFit,
        remainingText,
        printedLines: lines,
      };
    },
  };
}
