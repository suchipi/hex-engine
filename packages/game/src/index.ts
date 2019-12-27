import {
  Entity,
  Component,
  component,
  Canvas,
  Point,
  Angle,
  Preloader,
  Keyboard,
  Position,
  AnimationSheet,
  Animation,
  BasicRenderer,
  Audio,
  Size,
} from "engine";
import bouncy from "./bouncy-29x41.png";
import jump from "./jump.wav";

const player = new Entity(
  new Keyboard(),
  new Position(0, 0, {
    origin: new Point(29 / 2, 41 / 2),
  }),
  new AnimationSheet({
    url: bouncy,
    tileWidth: 29,
    tileHeight: 41,
    animations: {
      default: new Animation({
        frames: [0, new Animation.Frame(1, ["jump"]), 2, 3, 4, 5, 6, 7],
        duration: 150,
      }),
    },
  }),
  new BasicRenderer(),

  function PlayerControls() {
    component.onUpdate((delta) => {
      const keyboard = component.getComponent(Keyboard)!;
      const vector = keyboard.vectorFromKeys("w", "s", "a", "d");
      vector.magnitude *= delta * 0.1;

      const position = component.getComponent(Position)!;
      position.point = position.point.add(vector.toPoint()).round();
    });
  },

  // Animation event sounds
  function AnimationEventSounds() {
    const jumpSound = component.addChildComponent(new Audio({ url: jump }));

    const onAnimationEvent = (event: string) => {
      if (event === "jump") {
        jumpSound.play({ volume: 0.1 });
      }
    };

    component.onEnabled(() => {
      component.getEntity()?.on("animation-event", onAnimationEvent);
    });

    component.onDisabled(() => {
      component.getEntity()?.off("animation-event", onAnimationEvent);
    });
  }
);

const stage = new Entity(
  new Position(0, 0),
  new Size(50, 50),

  function StageRenderer() {
    component.onDraw(({ context }) => {
      const position = component.getComponent(Position)?.point;
      if (!position) return;
      let size = component.getComponent(Size)?.point;
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
);

const canvas = new Canvas();
canvas.fullscreen({ pixelRatio: 3 });

class CameraControlBehaviour extends Component {
  killInputFor: number = 0;

  update(delta: number) {
    if (this.killInputFor > 0) {
      this.killInputFor -= delta;
      if (this.killInputFor > 0) return;
    }

    const camera = this.getComponent(Canvas.Camera);
    if (!camera) return;

    const keyboard = this.getComponent(Keyboard)!;

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
      this.killInputFor = 100;
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
      this.killInputFor = 100;
    }
  }
}

canvas.addComponent(new CameraControlBehaviour());
canvas.addComponent(new Keyboard());

canvas.addChild(stage);
canvas.addChild(player);

import * as ecs from "engine";
// @ts-ignore
window.ecs = ecs;
// @ts-ignore
window.canvas = canvas;

canvas.element.style.display = "none";
Preloader.load().then(() => {
  canvas.element.style.display = "";
});
