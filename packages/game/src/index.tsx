import * as hex from "@hex-engine/2d";
// @ts-ignore
window.hex = hex;

import {
  createEntity,
  useEntityName,
  useNewComponent,
  Canvas,
  Position,
  Vec2,
  SystemFont,
  useUpdate,
  Clickable,
  Label,
  FilterRenderer,
  ImageFilter,
} from "@hex-engine/2d";

const canvas = createEntity(() => {
  useEntityName("canvas");
  const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
  canvas.setPixelated(true);
  canvas.fullscreen({ pixelZoom: 3 });
});

const label = createEntity(() => {
  useEntityName("label");

  const font = useNewComponent(() => SystemFont({ name: "Silver", size: 18 }));
  useNewComponent(() => Position(new Vec2(100, 100)));
  useNewComponent(() => Label({ text: "Hello there", font }));

  const filter = useNewComponent(() =>
    ImageFilter((imageData) => {
      const pixels = imageData.data;
      for (let i = 0; i < pixels.length; i += 4) {
        const a = pixels[i + 3];
        if (a < 255) {
          pixels[i + 3] = 0;
        }
      }
    })
  );
  useNewComponent(() => FilterRenderer(filter));

  const clickable = useNewComponent(Clickable);
  useUpdate(() => {
    if (clickable.isHovering) {
      font.color = "red";
    } else {
      font.color = "black";
    }
    if (clickable.isHovering && clickable.isPressing) {
      font.color = "blue";
    }
  });
});

canvas.addChild(label);

// @ts-ignore
window.canvas = canvas;
