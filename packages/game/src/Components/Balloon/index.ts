import {
  useNewComponent,
  Position,
  Vec2,
  Aseprite,
  useDraw,
  BoundingBox,
  ImageFilter,
  useType,
} from "@hex-engine/2d";

import sprite from "./balloon.aseprite";

export default function Balloon({
  r,
  g,
  b,
  x,
  y,
}: {
  r: number;
  g: number;
  b: number;
  x: number;
  y: number;
}) {
  useType(Balloon);

  useNewComponent(() => Position(new Vec2(x, y)));
  const size = useNewComponent(() => BoundingBox(new Vec2(16, 16)));

  const aseprite = useNewComponent(() => Aseprite(sprite));

  aseprite.currentAnim.play();

  const filter = useNewComponent(() =>
    ImageFilter((imageData) => {
      const pixels = imageData.data;
      for (let i = 0; i < pixels.length; i += 4) {
        pixels[i + 0] = (pixels[i + 0] / 255) * (r / 255) * 255;
        pixels[i + 1] = (pixels[i + 1] / 255) * (g / 255) * 255;
        pixels[i + 2] = (pixels[i + 2] / 255) * (b / 255) * 255;
      }
    })
  );

  useDraw((context, backstage) => {
    aseprite.drawCurrentFrameIntoContext({ context: backstage });

    filter.apply(backstage, context);
  });
}
