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
  useExistingComponentByType,
  useNewComponent,
  useDraw,
  createEntity,
  useName,
  Camera,
  Rotation,
  useType,
} from "@hex-engine/2d";
import bouncy from "./bouncy-29x41.png";
import jump from "./jump.wav";

const camera = createEntity(() => {
  useName("camera");
  useNewComponent(() => Position(new Vec2(-100, -100)));
  useNewComponent(() => Rotation(new Angle(0)));
  useNewComponent(() => Camera());
});

const player = createEntity(() => {
  useName("player");
  useNewComponent(() => Keyboard());
  useNewComponent(() => Position(new Vec2(0, 0)));
  const size = useNewComponent(() => Size(new Vec2(29, 41)));
  useNewComponent(() => Origin(size.dividedBy(2)));

  const jumpSound = useNewComponent(() => Audio({ url: jump }));
  useNewComponent(() =>
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
  useNewComponent(BasicRenderer);
  useNewComponent(function PlayerControls() {
    useType(PlayerControls);

    return useUpdate((delta) => {
      const keyboard = useExistingComponentByType(Keyboard)!;
      const vector = keyboard.vectorFromKeys("w", "s", "a", "d");
      vector.magnitude *= delta * 0.1;

      const position = useExistingComponentByType(Position)!;
      position.replace(position.add(vector.toVec2()).round());
    });
  });
});

const stage = createEntity(() => {
  useName("stage");
  useNewComponent(() => Position(new Vec2(0, 0)));
  useNewComponent(() => Size(new Vec2(50, 50)));

  return useDraw((context) => {
    const position = useExistingComponentByType(Position);
    if (!position) return;
    let size: Vec2 | null = useExistingComponentByType(Size);
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
  const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
  canvas.fullscreen({ pixelZoom: 3 });
});

canvas.addChild(stage);
canvas.addChild(player);
canvas.addChild(camera);

// @ts-ignore
window.canvas = canvas;
