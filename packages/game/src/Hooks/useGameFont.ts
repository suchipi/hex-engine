import {
  useNewComponent,
  SystemFont,
  ImageFilter,
  useRawDraw,
} from "@hex-engine/2d";

export default function useGameFont() {
  const font = useNewComponent(() => SystemFont({ name: "Silver", size: 18 }));

  const onlyDrawFullyOpaquePixels = useNewComponent(() =>
    ImageFilter((imageData) => {
      const pixels = imageData.data;
      for (let i = 0; i < pixels.length; i++) {
        if (pixels[i + 3] < 255) {
          pixels[i + 3] = 0;
        }
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
  font.drawText = ({ context, text, x, y }) => {
    normalDrawText.call(font, {
      context: backstage,
      text,
      x,
      y,
    });

    onlyDrawFullyOpaquePixels.apply(backstage, context);
  };

  return font;
}
