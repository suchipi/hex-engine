import * as hex from "@hex-engine/2d";
// @ts-ignore
window.hex = hex;

import {
  Canvas,
  Point,
  Keyboard,
  Position,
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
} from "@hex-engine/2d";
import bouncy from "./bouncy-29x41.png";
// import jump from "./jump.wav";

function PlayerControls() {
  return useUpdate((delta) => {
    const keyboard = useExistingComponent(Keyboard)!;
    const vector = keyboard.vectorFromKeys("w", "s", "a", "d");
    vector.magnitude *= delta * 0.1;

    const position = useExistingComponent(Position)!;
    position.point = position.point.add(vector.toPoint()).round();
  });
}

const player = createEntity(function Player() {
  useNewComponent(Keyboard);
  useNewComponent(Position, {
    point: new Point(0, 0),
    origin: new Point(29 / 2, 41 / 2),
  });
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

const stage = createEntity(function Stage() {
  useNewComponent(Position, { point: new Point(0, 0) });
  useNewComponent(Size, new Point(50, 50));

  return useDraw((context) => {
    const position = useExistingComponent(Position)?.point;
    if (!position) return;
    let size = useExistingComponent(Size)?.point;
    if (!size) size = new Point(10, 10);

    context.strokeStyle = "black";
    context.strokeRect(
      position.x - size.x / 2,
      position.y - size.y / 2,
      size.x,
      size.y
    );
  });
});

const canvas = createEntity(function MyCanvas() {
  const canvas = useNewComponent(Canvas, { backgroundColor: "white" });
  canvas.fullscreen({ pixelRatio: 3 });
});

canvas.addChild(stage);
canvas.addChild(player);

// @ts-ignore
window.canvas = canvas;
