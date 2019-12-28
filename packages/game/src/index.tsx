import {
  Entity,
  Canvas,
  Point,
  Angle,
  Preloader,
  Keyboard,
  Position,
  AnimationSheet,
  Animation,
  AnimationFrame,
  BasicRenderer,
  Size,
  onUpdate,
  getComponent,
  create,
  onDraw,
} from "@hex-engine/2d";
import bouncy from "./bouncy-29x41.png";
// import jump from "./jump.wav";

function PlayerControls() {
  onUpdate((delta) => {
    const keyboard = getComponent(Keyboard)!;
    const vector = keyboard.vectorFromKeys("w", "s", "a", "d");
    vector.magnitude *= delta * 0.1;

    const position = getComponent(Position)!;
    position.point = position.point.add(vector.toPoint()).round();
  });
}

function Player() {
  create(Keyboard);
  create(Position, {
    point: new Point(0, 0),
    origin: new Point(29 / 2, 41 / 2),
  });
  create(AnimationSheet, {
    url: bouncy,
    tileWidth: 29,
    tileHeight: 41,
    animations: {
      // @ts-ignore TODO: embedded generic support :\
      default: create(
        Animation,
        [0, 1, 2, 3, 4, 5, 6, 7].map(
          (num) => new AnimationFrame(num, { duration: 150 })
        )
      ),
    },
  });
  create(BasicRenderer);
  create(PlayerControls);
  // create(AnimationEventSounds);
}

const player = Entity.create(Player);

function Stage() {
  create(Position, { point: new Point(0, 0) });
  create(Size, new Point(50, 50));

  onDraw(({ context }) => {
    const position = getComponent(Position)?.point;
    if (!position) return;
    let size = getComponent(Size)?.point;
    if (!size) size = new Point(10, 10);

    context.strokeStyle = "black";
    context.strokeRect(
      position.x - size.x / 2,
      position.y - size.y / 2,
      size.x,
      size.y
    );
  });
}
const stage = Entity.create(Stage);

function MyCanvas() {
  const canvas = create(Canvas, { backgroundColor: "white" });
  canvas.fullscreen({ pixelRatio: 3 });

  create(CameraControlBehaviour);
}

function CameraControlBehaviour() {
  let killInputFor = 0;
  const keyboard = create(Keyboard);

  onUpdate((delta: number) => {
    if (killInputFor > 0) {
      killInputFor -= delta;
      if (killInputFor > 0) return;
    }

    const camera = getComponent(Canvas.Camera);
    if (!camera) {
      console.log("no camera");
      return;
    }

    // position
    const vector = keyboard.vectorFromKeys("i", "k", "j", "l");
    vector.magnitude *= delta * 0.5;

    const position = camera.position;
    const newPosition = position.add(vector.toPoint());
    camera.position = newPosition.round();

    // rotation
    if (keyboard.pressed.has("u")) {
      camera.rotation = camera.rotation.add(delta * 0.005);
    }

    if (keyboard.pressed.has("o")) {
      camera.rotation = camera.rotation.subtract(delta * 0.005);
    }

    if (keyboard.pressed.has("u") && keyboard.pressed.has("o")) {
      camera.rotation = new Angle(0);
      killInputFor = 100;
    }

    // zoom
    if (keyboard.pressed.has("n")) {
      camera.zoom = camera.zoom + delta * 0.001;
    }

    if (keyboard.pressed.has("m")) {
      camera.zoom = camera.zoom - delta * 0.001;
    }

    if (keyboard.pressed.has("n") && keyboard.pressed.has("m")) {
      camera.zoom = 1;
      killInputFor = 100;
    }
  });
}

const canvas = Entity.create(MyCanvas);

canvas.addChild(stage);
canvas.addChild(player);

import * as hex from "@hex-engine/2d";
// @ts-ignore
window.hex = hex;
// @ts-ignore
window.canvas = canvas;
