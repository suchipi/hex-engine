import { useType, useNewComponent } from "@hex-engine/core";
import createLayout from "layout-bmfont-text";
import Image from "./Image";
import Font from "./Font";
// import FontMetrics from "./FontMetrics";

export default function BMFont(data: BMFontLoader.Font) {
  useType(BMFont);

  const images = data.pages.map((page) =>
    useNewComponent(() => Image({ url: page }))
  );

  const layout = createLayout({ font: data, text: "" });

  const api = {
    readyToDraw() {
      return images.every((image) => image.loaded);
    },
    measureWidth(text: string) {
      layout.update({ font: data, text });
      return layout.width;
    },
    getFontSize() {
      return data.info.size;
    },
    drawText({
      context,
      text,
      x = 0,
      y = 0,
      wrapWidth,
    }: {
      context: CanvasRenderingContext2D;
      text: string;
      x?: undefined | number;
      y?: undefined | number;
      wrapWidth?: undefined | number;
    }) {
      layout.update({ font: data, text, width: wrapWidth });

      for (const glyph of layout.glyphs) {
        const image = images[glyph.data.page];
        if (!image) {
          throw new Error("BMFont referenced out-of-bounds page");
        }
        if (!image.data) return;

        image.drawIntoContext({
          context,
          targetX: glyph.position[0] + x + glyph.data.xoffset,
          targetY: glyph.position[1] + y + glyph.data.yoffset + layout.baseline,
          sourceX: glyph.data.x,
          sourceY: glyph.data.y,
          sourceWidth: glyph.data.width,
          sourceHeight: glyph.data.height,
          targetWidth: glyph.data.width,
          targetHeight: glyph.data.height,
        });
      }
    },
    measureText(text: string, wrapWidth?: number) {
      layout.update({ font: data, text, width: wrapWidth });

      return {
        baseline: layout.baseline,
        median: layout.height / 2,
        descender: layout.descender,
        ascender: layout.ascender,
        capHeight: layout.capHeight,
        ascent: Math.max(layout.ascender, layout.capHeight),
        height: layout.height,
        lineHeight: layout.lineHeight,
        width: layout.width,
      };
    },
  };

  useNewComponent(() => Font(api));

  return {
    data,
    images,
    layout,
    ...api,
  };
}
