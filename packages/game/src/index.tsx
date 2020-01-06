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
  BasicRenderer,
  useEnableDisable,
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
  const clickable = useNewComponent(Clickable);
  useNewComponent(BasicRenderer);

  const updateApi = useUpdate(() => {
    if (clickable.isHovering) {
      font.color = "red";
    } else {
      font.color = "black";
    }
    if (clickable.isHovering && clickable.isPressing) {
      font.color = "blue";
    }
  });

  return useEnableDisable.combineApis(updateApi, clickable);
});

canvas.addChild(label);

// @ts-ignore
window.canvas = canvas;
