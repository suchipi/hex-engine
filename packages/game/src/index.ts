import {
  Entity,
  Canvas,
  Keyboard,
  Component,
  Position,
  Rectangle,
} from "engine";

class KeyboardLogger extends Entity {
  constructor(...components: Array<Component>) {
    super(...components, new Keyboard());
  }

  update() {
    const keyboard = this.getComponent(Keyboard);
    if (!keyboard) {
      return;
    }
    console.log(keyboard.pressed);
  }
}

const rect = new Entity(new Position(0, 0), new Rectangle(100, 100, "red"));

const logger = new KeyboardLogger();

const canvas = new Canvas();

canvas.addChild(rect);
canvas.addChild(logger);
