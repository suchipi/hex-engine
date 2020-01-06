import * as hex from "@hex-engine/2d";
// @ts-ignore
window.hex = hex;

import {
  createEntity,
  useEntityName,
  useNewComponent,
  Canvas,
  Position,
  Origin,
  Vec2,
  SystemFont,
  useDraw,
  ImageFilter,
  Clickable,
  BoundingBox,
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
  const origin = useNewComponent(() => Origin(new Vec2(0, 18)));
  const bounds = useNewComponent(() => BoundingBox(new Vec2(0, 18)));
  const clickable = useNewComponent(Clickable);

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

  const drawApi = useDraw((context, backstage) => {
    bounds.x = font.measureTextWidth({
      context,
      text: state.text,
    });
    bounds.y = typeof font.size === "number" ? font.size : parseInt(font.size);
    origin.y = typeof font.size === "number" ? font.size : parseInt(font.size);
    origin.y = (3 / 4) * origin.y;
    origin.replace(origin.round());

    const worldPos = position.asWorldPosition();
    const bgPos = worldPos.subtract(origin);

    if (clickable.isHovering) {
      context.fillStyle = "red";
      context.fillRect(bgPos.x, bgPos.y, bounds.x, bounds.y);
    }

    if (clickable.isHovering && clickable.isPressing) {
      context.fillStyle = "blue";
      context.fillRect(bgPos.x, bgPos.y, bounds.x, bounds.y);
    }

    font.drawText({
      context: backstage,
      text: state.text,
      x: worldPos.x,
      y: worldPos.y,
    });

    imageFilter.apply(backstage, context);
  });

  clickable.onClick(() => console.log("click"));
  clickable.onDown(() => console.log("down"));
  clickable.onUp(() => console.log("up"));
  clickable.onEnter(() => console.log("enter"));
  clickable.onLeave(() => console.log("leave"));

  let isEnabled = true;

  return {
    getIsEnabled: () => isEnabled,
    enable: () => {
      isEnabled = true;
      drawApi.enable();
      clickable.enable();
    },
    disable: () => {
      isEnabled = false;
      drawApi.disable();
      clickable.disable();
    },
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
