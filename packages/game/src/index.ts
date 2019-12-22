import { Entity, Canvas } from "engine";

class KeyboardLogger extends Entity {
  defaults() {
    return {
      keyboard: true,
    };
  }

  update() {
    const keyboard = this.getComponent("keyboard");
    if (!keyboard) {
      return;
    }
    console.log(keyboard.pressed);
  }
}

const rect = new Entity({
  position: {
    x: 0,
    y: 0,
  },
  rectangle: {
    color: "blue",
    height: 100,
    width: 100,
  },
});

const logger = new KeyboardLogger();

const canvas = new Canvas();

canvas.addChild(rect);
canvas.addChild(logger);
