import { useType, useNewComponent } from "@hex-engine/core";
import createLayout from "layout-bmfont-text";
import Image from "./Image";
import Font from "./Font";
import FontMetrics from "./FontMetrics";

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
      layout.update({ font: data, text, mode: "pre" });
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
    }: {
      context: CanvasRenderingContext2D;
      text: string;
      x?: undefined | number;
      y?: undefined | number;
    }) {
      layout.update({ font: data, text });

      for (const glyph of layout.glyphs) {
        const image = images[glyph.data.page];
        if (!image) {
          throw new Error("BMFont referenced out-of-bounds page");
        }
        if (!image.data) return;

        image.drawIntoContext({
          context,
          targetX: glyph.position[0] + x + glyph.data.xoffset,
          targetY: glyph.position[1] + y + glyph.data.yoffset,
          sourceX: glyph.data.x,
          sourceY: glyph.data.y,
          sourceWidth: glyph.data.width,
          sourceHeight: glyph.data.height,
          targetWidth: glyph.data.width,
          targetHeight: glyph.data.height,
        });
      }
    },
  };

  const fontMetrics = useNewComponent(() => FontMetrics(api));

  const fontApi = {
    ...api,
    drawText({
      context,
      text,
      x = 0,
      y = 0,
    }: {
      context: CanvasRenderingContext2D;
      text: string;
      x?: undefined | number;
      y?: undefined | number;
    }) {
      api.drawText({
        context,
        text,
        x,
        y: y + fontMetrics.measureText(text).height,
      });
    },
    measureText: fontMetrics.measureText,
  };
  useNewComponent(() => Font(fontApi));

  return {
    data,
    images,
    layout,
    ...fontApi,
  };
}
