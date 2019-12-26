import * as ecs from "engine";

class PlayerBehaviour extends ecs.Component {
  update(delta: number) {
    const keyboard = this.getComponent(ecs.Components.Keyboard)!;
    const vector = keyboard.vectorFromKeys("w", "s", "a", "d");
    vector.magnitude *= delta * 0.1;

    const position = this.getComponent(ecs.Components.Position)!;
    position.point = position.point.add(vector.toPoint());
  }
}

class CameraControlBehaviour extends ecs.Component {
  update(delta: number) {
    const keyboard = this.getComponent(ecs.Components.Keyboard)!;

    const vector = keyboard.vectorFromKeys(
      "UpArrow",
      "DownArrow",
      "LeftArrow",
      "RightArrow"
    );
    vector.magnitude *= delta * 0.5;

    const camera = this.getComponent(ecs.Canvas.Camera)!;

    const position = camera.position;
    camera.position = position.add(vector.toPoint());
  }
}

class Player extends ecs.Entity {
  constructor(...components: Array<ecs.Component>) {
    super(
      ...components,
      new ecs.Components.Keyboard(),
      new ecs.Components.Position(0, 0),
      new ecs.Components.Rectangle(100, 100, "red"),
      new PlayerBehaviour()
    );
  }
}

const player = new Player();
const canvas = new ecs.Canvas();

canvas.addComponent(new CameraControlBehaviour());

canvas.addChild(player);

// @ts-ignore
window.ecs = ecs;
// @ts-ignore
window.canvas = canvas;
