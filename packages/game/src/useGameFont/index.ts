import {
  useNewComponent,
  BMFont,
  ImageFilter,
  useBackstage,
} from "@hex-engine/2d";
import silver from "./silver.fnt";

export default function useGameFont() {
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

  const backstage = useBackstage();

  const normalDrawText = font.drawText;
  font.drawText = ({ context, text, x, y }) => {
    normalDrawText.call(font, {
      context: backstage,
      text,
      x,
      y,
    });

    filter.apply(backstage, context);
  };

  return font;
}
