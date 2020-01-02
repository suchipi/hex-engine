import * as hex from "@hex-engine/2d";
// @ts-ignore
window.hex = hex;

import {
  Audio,
  Canvas,
  Vec2,
  Angle,
  Keyboard,
  Position,
  Origin,
  AnimationSheet,
  Animation,
  AnimationFrame,
  BasicRenderer,
  Size,
  useUpdate,
  useExistingComponent,
  useNewComponent,
  useDraw,
  createEntity,
  useName,
  Camera,
  Rotation,
  Grid,
} from "@hex-engine/2d";
import bouncy from "./bouncy-29x41.png";
import jump from "./jump.wav";

const camera = createEntity(() => {
  useName("camera");
  useNewComponent(Position, () => Position(new Vec2(-100, -100)));
  useNewComponent(Rotation, () => Rotation(new Angle(0)));
  useNewComponent(Camera, () => Camera());
});

const player = createEntity(() => {
  useName("player");
  useNewComponent(Keyboard, () => Keyboard());
  useNewComponent(Position, () => Position(new Vec2(0, 0)));
  const size = useNewComponent(Size, () => Size(new Vec2(29, 41)));
  useNewComponent(Origin, () => Origin(size.dividedBy(2)));

  const jumpSound = useNewComponent(Audio, () => Audio({ url: jump }));
  useNewComponent(AnimationSheet, () =>
    AnimationSheet({
      url: bouncy,
      tileWidth: 29,
      tileHeight: 41,
      animations: {
        default: useNewComponent(Animation, () =>
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
  useNewComponent(BasicRenderer, () => BasicRenderer());

  function PlayerControls() {
    return useUpdate((delta) => {
      const keyboard = useExistingComponent(Keyboard)!;
      const vector = keyboard.vectorFromKeys("w", "s", "a", "d");
      vector.magnitude *= delta * 0.1;

      const position = useExistingComponent(Position)!;
      position.replace(position.add(vector.toVec2()).round());
    });
  }

  useNewComponent(PlayerControls, () => PlayerControls());
});

const stage = createEntity(() => {
  useName("stage");
  useNewComponent(Position, () => Position(new Vec2(0, 0)));
  useNewComponent(Size, () => Size(new Vec2(50, 50)));

  return useDraw((context) => {
    const position = useExistingComponent(Position);
    if (!position) return;
    let size: Vec2 | null = useExistingComponent(Size);
    if (!size) size = new Vec2(10, 10);

    context.strokeStyle = "black";
    context.strokeRect(
      position.x - size.x / 2,
      position.y - size.y / 2,
      size.x,
      size.y
    );
  });
});

const canvas = createEntity(() => {
  useName("canvas");
  const canvas = useNewComponent(Canvas, () =>
    Canvas({ backgroundColor: "white" })
  );
  canvas.fullscreen({ pixelZoom: 3 });

  return {
    grid: new Grid(5, 5, 0),
  };
});

canvas.addChild(stage);
canvas.addChild(player);
canvas.addChild(camera);

// @ts-ignore
window.canvas = canvas;
