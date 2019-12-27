import * as ecs from "engine";
import bouncy from "./bouncy-29x41.png";
import jump from "./jump.wav";

class AnimationEventSounds extends ecs.Component {
  jumpSound: ecs.Components.Audio = new ecs.Components.Audio({ url: jump });

  onEntityReceived(ent: ecs.Entity | null) {
    ent?.addComponent(this.jumpSound);
  }

  onEnabled() {
    this.entity?.on("animation-event", this.onAnimationEvent);
  }

  onDisabled() {
    this.entity?.off("animation-event", this.onAnimationEvent);
  }

  onAnimationEvent = (event: string) => {
    if (event === "jump") {
      this.jumpSound.play();
    }
  };
}

class PlayerBehaviour extends ecs.Component {
  update(delta: number) {
    const keyboard = this.getComponent(ecs.Components.Keyboard)!;
    const vector = keyboard.vectorFromKeys("w", "s", "a", "d");
    vector.magnitude *= delta * 0.1;

    const position = this.getComponent(ecs.Components.Position)!;
    position.point = position.point.add(vector.toPoint()).round();
  }

  draw({
    context,
  }: {
    context: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
  }) {
    const animSheet = this.getComponent(ecs.Components.AnimationSheet)!;
    const position = this.getComponent(ecs.Components.Position)!;

    const target = position.drawPoint();

    animSheet.drawSpriteIntoContext({
      context,
      x: target.x,
      y: target.y,
    });
  }
}

class Player extends ecs.Entity {
  constructor() {
    super(
      new ecs.Components.Keyboard(),
      new ecs.Components.Position(0, 0, {
        origin: new ecs.Point(29 / 2, 41 / 2),
      }),
      new ecs.Components.AnimationSheet({
        url: bouncy,
        tileWidth: 29,
        tileHeight: 41,
        animations: {
          default: new ecs.Components.Animation({
            frames: [
              0,
              new ecs.Components.Animation.Frame({
                data: 1,
                animationEvents: ["jump"],
              }),
              2,
              3,
              4,
              5,
              6,
              7,
            ],
            duration: 150,
          }),
        },
      }),
      new PlayerBehaviour(),
      new AnimationEventSounds()
    );
  }
}

const player = new Player();

class StageRenderer extends ecs.Component {
  draw({
    context,
  }: {
    context: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
  }) {
    const position = this.getComponent(ecs.Components.Position)?.point;
    if (!position) return;
    let size = this.getComponent(ecs.Components.Size)?.point;
    if (!size) size = new ecs.Point(10, 10);

    context.strokeStyle = "black";
    context.strokeRect(
      position.x - size.x / 2,
      position.y - size.y / 2,
      size.x,
      size.y
    );
  }
}

const stage = new ecs.Entity(
  new ecs.Components.Position(0, 0),
  new ecs.Components.Size(50, 50),
  new StageRenderer()
);

const canvas = new ecs.Canvas();
canvas.fullscreen({ pixelRatio: 3 });

class CameraControlBehaviour extends ecs.Component {
  killInputFor: number = 0;

  update(delta: number) {
    if (this.killInputFor > 0) {
      this.killInputFor -= delta;
      if (this.killInputFor > 0) return;
    }

    const camera = this.getComponent(ecs.Canvas.Camera);
    if (!camera) return;

    const keyboard = this.getComponent(ecs.Components.Keyboard)!;

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
      camera.rotation = new ecs.Angle(0);
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
canvas.addComponent(new ecs.Components.Keyboard());

canvas.addChild(stage);
canvas.addChild(player);

// @ts-ignore
window.ecs = ecs;
// @ts-ignore
window.canvas = canvas;

console.log("loading...");
canvas.element.style.display = "none";
ecs.Preloader.load().then(() => {
  canvas.element.style.display = "";
  console.log("loaded");
});
