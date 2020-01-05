import * as hex from "@hex-engine/2d";
// @ts-ignore
window.hex = hex;

import {
  createEntity,
  useEntityName,
  useNewComponent,
  Canvas,
  Component,
  Position,
  Vec2,
  SystemFont,
  useDraw,
} from "@hex-engine/2d";

const canvas = createEntity(() => {
  useEntityName("canvas");
  const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
  canvas.setPixelated(true);
  canvas.fullscreen({ pixelZoom: 3 });

  useNewComponent(() =>
    Canvas.DrawOrder((entities) => {
      let components: Array<Component> = [];

      // Draw cameras first
      for (const ent of entities) {
        components = components.concat(
          [...ent.components].filter((comp: any) => comp.isCamera)
        );
      }

      // Then draw non-cameras, sorted by entity world position y
      const sortedEnts = [...entities].sort((entA, entB) => {
        const posA =
          entA.getComponent(Position)?.asWorldPosition() || new Vec2(0, 0);
        const posB =
          entB.getComponent(Position)?.asWorldPosition() || new Vec2(0, 0);

        return posA.y - posB.y;
      });

      return sortedEnts.flatMap((ent) =>
        [...ent.components].filter((comp: any) => !comp.isCamera)
      );
    })
  );
});

const label = createEntity(() => {
  const font = useNewComponent(() => SystemFont({ name: "Arial", size: 24 }));

  useDraw((context) => {
    font.drawText({
      context,
      text: "Hello world",
      x: 100,
      y: 100,
    });
  });
});

canvas.addChild(label);

// @ts-ignore
window.canvas = canvas;
