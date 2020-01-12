import {
  useNewComponent,
  BMFont,
  ImageFilter,
  useRawDraw,
  // SystemFont,
} from "@hex-engine/2d";
import silver from "./silver.fnt";

export default function useGameFont() {
  // return useNewComponent(() => SystemFont({ name: "Arial", size: 12 }));

  const font = useNewComponent(() => BMFont(silver));

  const filter = useNewComponent(() =>
    ImageFilter((imageData) => {
      const pixels = imageData.data;
      for (let i = 0; i < pixels.length; i += 4) {
        pixels[i + 0] = 0; // r
        pixels[i + 1] = 0; // g
        pixels[i + 2] = 0; // b
      }
    })
  );

  // TODO: this is hacky. Need to break up useRawDraw into
  // fundamental useContext and useBackstage so we can use
  // those here instead.
  let backstage: CanvasRenderingContext2D;
  useRawDraw((_context, back) => {
    backstage = back;
  });

  const normalDrawText = font.drawText;
  font.drawText = ({ context, text, x, y, wrapWidth }) => {
    normalDrawText.call(font, {
      context: backstage,
      text,
      x,
      y,
      wrapWidth,
    });

    filter.apply(backstage, context);
  };

  return font;
}
