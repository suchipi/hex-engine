import {
  Entity,
  Canvas,
  Keyboard,
  Component,
  Position,
  Rectangle,
} from "engine";

class PlayerBehaviour extends Component {
  update() {
    let keyboard = this.getComponent(Keyboard);
    if (!keyboard) return;

    console.log(keyboard.pressed);
  }
}

class Player extends Entity {
  constructor(...components: Array<Component>) {
    super(...components, new Keyboard(), new PlayerBehaviour());
  }
}

const rect = new Entity(new Position(0, 0), new Rectangle(100, 100, "red"));

const player = new Player();

const canvas = new Canvas();

canvas.addChild(rect);
canvas.addChild(player);
