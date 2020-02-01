import { useType } from "@hex-engine/core";
import { useInspectorHoverOutline } from "../Hooks";
import { FontImplementation } from "./Font";
import { Vector, Polygon } from "../Models";

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

/**
 * This Component lays out text in lines, fitting as many words as it can on
 * one line before continue onto the next. When you use it, it tells you which
 * lines it rendered, and which parts of the text you provided didn't fit into
 * the text box (if any). You can use this information to re-render the text
 * box with new content, once the user has read the text.
 */
export default function TextBox({
  font,
  size,
  lineHeight: receivedLineHeight,
}: {
  /** A Font to use to render the text. You can use a Font, SystemFont, or BMFont. */
  font: FontImplementation;

  /** The size of the text box. This determines how much content can fit inside. */
  size: Vector;

  /** How much height to provide for each line of text. */
  lineHeight?: number;
}) {
  useType(TextBox);

  const shape = Polygon.rectangle(size);
  useInspectorHoverOutline(() => shape);

  return {
    /**
     * Draws as much of the provided text as will fit into the textbox,
     * then returns information about how much text was drawn.
     */
    drawText(
      context: CanvasRenderingContext2D,
      text: string,
      {
        x = 0,
        y = 0,
      }: {
        x?: number;
        y?: number;
      } = {}
    ) {
      if (!font.readyToDraw())
        return { didTextFit: false, remainingText: text, printedLines: [] };

      let lineHeight = receivedLineHeight!;
      if (lineHeight == null) {
        const metrics = font.measureText("hi");
        lineHeight = metrics.height + metrics.descender;
      }

      const tokens = textToTokens(text);
      const seenTokens: Array<string> = [];

      const lines: Array<string> = [];

      let didTextFit = true;
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
          didTextFit = false;
          remainingText = tokensToText(tokens);
        } else {
          didTextFit = true;
          remainingText = "";
        }

        lines.push(line);
      }

      lines.forEach((line, index) => {
        const lineOffset = lineHeight * index;
        font.drawText(context, line, { x, y: y + lineOffset });
      });

      return {
        /** A boolean indicating whether all the text that was provided fit into the textbox. */
        didTextFit,

        /** A string containing any remaining text that didn't fit into the box. */
        remainingText,

        /** An Array containing all the lines that were printed. */
        printedLines: lines,
      };
    },
  };
}
