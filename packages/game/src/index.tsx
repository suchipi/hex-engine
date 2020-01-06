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
  Mouse,
  useExistingComponentByType,
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
  const position = useNewComponent(() => Position(new Vec2(100, 100)));
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
    if (clickable.isPressing) {
      font.color = "blue";
    }
  });

  const mouse = useExistingComponentByType(Mouse) || useNewComponent(Mouse);
  mouse.onMouseMove((_pos, delta) => {
    if (clickable.isPressing) {
      position.replace(position.add(delta));
    }
  });
  mouse.onMouseUp(() => {
    position.replace(position.round());
  });
});

canvas.addChild(label);

// @ts-ignore
window.canvas = canvas;
