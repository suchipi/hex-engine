import * as hex from "@hex-engine/2d";
// @ts-ignore
window.hex = hex;

import {
  Canvas,
  Vec2,
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
} from "@hex-engine/2d";
import inspect from "@hex-engine/inspector";
import bouncy from "./bouncy-29x41.png";
// import jump from "./jump.wav";

function PlayerControls() {
  return useUpdate((delta) => {
    const keyboard = useExistingComponent(Keyboard)!;
    const vector = keyboard.vectorFromKeys("w", "s", "a", "d");
    vector.magnitude *= delta * 0.1;

    const position = useExistingComponent(Position)!;
    position.replace(position.add(vector.toVec2()).round());
  });
}

const player = createEntity(() => {
  useName("player");
  useNewComponent(Keyboard);
  useNewComponent(Position, new Vec2(0, 0));
  const size = useNewComponent(Size, new Vec2(29, 41));
  useNewComponent(Origin, size.dividedBy(2));
  useNewComponent(AnimationSheet, {
    url: bouncy,
    tileWidth: 29,
    tileHeight: 41,
    animations: {
      // @ts-ignore TODO: embedded generic support :\
      default: useNewComponent(
        Animation,
        [0, 1, 2, 3, 4, 5, 6, 7].map(
          (num) => new AnimationFrame(num, { duration: 150 })
        )
      ),
    },
  });
  useNewComponent(BasicRenderer);
  useNewComponent(PlayerControls);
});

const stage = createEntity(() => {
  useName("stage");
  useNewComponent(Position, new Vec2(0, 0));
  useNewComponent(Size, new Vec2(50, 50));

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
  const canvas = useNewComponent(Canvas, { backgroundColor: "white" });
  canvas.fullscreen({ pixelZoom: 3 });
});

canvas.addChild(stage);
canvas.addChild(player);

inspect(canvas);

// @ts-ignore
window.canvas = canvas;
