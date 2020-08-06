import { useType, useNewComponent } from "@hex-engine/core";
// @ts-ignore
import createLayout from "layout-bmfont-text";
import Image from "./Image";
import Font from "./Font";
import FontMetrics from "./FontMetrics";

/** This Component uses an AngelCode BMFont-format file to render text into the canvas. */
export default function BMFont(data: BMFontLoader.Font) {
  useType(BMFont);

  const images = data.pages.map((page) =>
    useNewComponent(() => Image({ url: page }))
  );

  const layout = createLayout({ font: data, text: "" });

  const api = {
    /** Whether all the images the font references have been loaded yet. */
    readyToDraw() {
      return images.every((image) => image.loaded);
    },
    /** Measures how many pixels wide the specified text would be, if it was rendered using this font. */
    measureWidth(text: string) {
      layout.update({ font: data, text, mode: "pre" });
      return layout.width;
    },
    /** Returns this font's size. */
    getFontSize() {
      return data.info.size;
    },
    /** Draws some text into the canvas, using this font. */
    drawText(
      context: CanvasRenderingContext2D,
      text: string,
      {
        x = 0,
        y = 0,
      }: {
        x?: number | undefined;
        y?: number | undefined;
      } = {}
    ) {
      layout.update({ font: data, text });

      for (const glyph of layout.glyphs) {
        const image = images[glyph.data.page];
        if (!image) {
          throw new Error("BMFont referenced out-of-bounds page");
        }
        if (!image.data) return;

        image.draw(context, {
          x: glyph.position[0] + x + glyph.data.xoffset,
          y: glyph.position[1] + y + glyph.data.yoffset,
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
    /** Draws some text into the canvas, using this font. */
    drawText(
      context: CanvasRenderingContext2D,
      text: string,
      {
        x = 0,
        y = 0,
        baseline = undefined,
      }: {
        x?: number | undefined;
        y?: number | undefined;
        baseline?: CanvasTextBaseline;
      } = {}
    ) {
      const measurements = fontMetrics.measureText(text);

      const yOffset = {
        alphabetic: 0,
        bottom: -Math.max(
          measurements.baselineToDescentLine,
          measurements.baselineToCJKBottom
        ),
        hanging:
          measurements.baselineToMeanLine +
          measurements.baselineToAscentLine / 2.5, // guesstimate cause I don't get hanging
        ideographic: measurements.baselineToCJKBottom,
        middle:
          -measurements.baselineToDescentLine +
          measurements.descentLineToAscentLine / 2,
        top: Math.max(
          measurements.baselineToAscentLine,
          measurements.baselineToCJKTop
        ),
      }[baseline || context.textBaseline];

      api.drawText(context, text, {
        x,
        y: y + yOffset,
      });
    },
    measureText: fontMetrics.measureText,
  };
  useNewComponent(() => Font(fontApi));

  return {
    /** The BMFont file data passed into this Component. */
    data,
    /** All the Image Components that this Component created in order to load the font. */
    images,
    ...fontApi,
  };
}
