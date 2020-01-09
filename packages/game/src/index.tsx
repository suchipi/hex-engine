import * as hex from "@hex-engine/2d";
// @ts-ignore
window.hex = hex;

import {
  Audio,
  Aseprite,
  Canvas,
  Vec2,
  Keyboard,
  Position,
  Origin,
  AnimationSheet,
  Animation,
  AnimationFrame,
  BoundingBox,
  useUpdate,
  useExistingComponentByType,
  useNewComponent,
  useDraw,
  createEntity,
  useEntityName,
  Camera,
  Rotation,
  useType,
  Component,
  Tiled,
  Scale,
  ImageFilter,
} from "@hex-engine/2d";
import bouncy from "./bouncy-29x41.png";
import jump from "./jump.wav";
import slimeBlue from "./slime-blue.aseprite";
import tiledMap from "./tiled-map 1.xml";

// @ts-ignore
window.tiledMap = tiledMap;

const camera = createEntity(() => {
  useEntityName("camera");
  useNewComponent(Position);
  useNewComponent(Rotation);
  useNewComponent(Scale);
  useNewComponent(Camera);
});

const player = createEntity(() => {
  useEntityName("player");

  useNewComponent(Position);
  const size = new Vec2(29, 41);
  useNewComponent(() => BoundingBox(size));
  useNewComponent(() => Origin(size.dividedBy(2)));
  useNewComponent(Rotation);
  useNewComponent(Scale);

  const jumpSound = useNewComponent(() => Audio({ url: jump }));
  const animSheet = useNewComponent(() =>
    AnimationSheet({
      url: bouncy,
      tileWidth: 29,
      tileHeight: 41,
      animations: {
        default: useNewComponent(() =>
          Animation(
            [0, 1, 2, 3, 4, 5, 6, 7].map(
              (num) =>
                new AnimationFrame(num, {
                  duration: 150,
                  onFrame:
                    num === 2
                      ? () => {
                          jumpSound.play({ volume: 0.0 });
                        }
                      : null,
                })
            )
          )
        ),
      },
    })
  );
  animSheet.currentAnim.play();

  const imageFilter = useNewComponent(() =>
    ImageFilter((imageData) => {
      const pixels = imageData.data;
      for (let i = 0; i < pixels.length; i += 4) {
        pixels[i + 0] = 255; // very red
      }
    })
  );

  useDraw((context, backstage) => {
    animSheet.drawSpriteIntoContext({ context: backstage });
    imageFilter.apply(backstage, context);
  });

  const keyboard = useNewComponent(() => Keyboard());
  useNewComponent(function PlayerControls() {
    useType(PlayerControls);

    useUpdate((delta) => {
      const vector = keyboard.vectorFromKeys("w", "s", "a", "d");
      vector.magnitude *= delta * 0.1;

      const position = useExistingComponentByType(Position)!;
      position.replace(position.add(vector.toVec2()).round());
    });
  });
});

const slime = createEntity(() => {
  useEntityName("slime");

  useNewComponent(() => Position(new Vec2(100, 50)));

  const aseprite = useNewComponent(() => Aseprite(slimeBlue));
  aseprite.currentAnim.play();

  useDraw((context) => {
    aseprite.drawCurrentFrameIntoContext({ context });
  });
});

const bg = createEntity(() => {
  useEntityName("bg");

  const map = useNewComponent(() => Tiled.Map(tiledMap));

  useDraw((context) => {
    map.tileMaps.forEach((tileMap) =>
      tileMap.drawMapIntoContext({
        context,
      })
    );
  });
});

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
        // Always draw bg first
        if (entA === bg) return -1;
        if (entB === bg) return 1;

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

canvas.addChild(bg);
canvas.addChild(camera);
canvas.addChild(player);
canvas.addChild(slime);

// @ts-ignore
window.canvas = canvas;
