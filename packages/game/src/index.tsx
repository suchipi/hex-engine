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
  useDraw,
  ImageFilter,
} from "@hex-engine/2d";

const canvas = createEntity(() => {
  useEntityName("canvas");
  const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
  canvas.setPixelated(true);
  canvas.fullscreen({ pixelZoom: 3 });
});

const label = createEntity(function Label() {
  const font = useNewComponent(() => SystemFont({ name: "Silver", size: 18 }));
  const position = useNewComponent(() => Position(new Vec2(100, 100)));

  const state = {
    text: "Hello world",
  };

  const imageFilter = useNewComponent(() =>
    ImageFilter(({ data }) => {
      for (let i = 0; i < data.length; i += 4) {
        let a = data[i + 3];

        if (a < 255) {
          a = 0;
        }

        data[i + 3] = a;
      }
    })
  );

  const enableDisableApi = useDraw((context, backstage) => {
    const worldPos = position.asWorldPosition();

    font.drawText({
      context: backstage,
      text: state.text,
      x: worldPos.x,
      y: worldPos.y,
    });

    imageFilter.apply(backstage, context);
  });

  return {
    ...enableDisableApi,
    get text() {
      return state.text;
    },
    set text(nextValue) {
      state.text = nextValue;
    },
  };
});

canvas.addChild(label);

// @ts-ignore
window.canvas = canvas;
