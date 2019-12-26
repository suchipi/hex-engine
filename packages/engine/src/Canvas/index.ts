import RunLoop from "./RunLoop";
import Time from "./Time";
import Renderer from "./Renderer";
import Camera from "./Camera";
import Entity from "../Entity";
import { Angle, Point } from "../Models";

type Data = {
  element: HTMLCanvasElement;
  backgroundColor: string;
};

export default class Canvas extends Entity {
  static Camera = Camera;
  static Renderer = Renderer;
  static Time = Time;
  static RunLoop = RunLoop;

  constructor(config: Partial<Data> = {}) {
    const backgroundColor = config.backgroundColor ?? "white";

    let canvas;
    if (config.element) {
      canvas = config.element;
    } else {
      canvas = document.createElement("canvas");
      document.body.appendChild(canvas);
    }

    const context = canvas.getContext("2d");
    if (context == null) {
      throw new Error("2d drawing context type not supported by browser");
    }

    super(
      new Time(),
      new Renderer({ canvas, context, backgroundColor }),
      new Camera({
        position: new Point(0, 0),
        zoom: 1,
        rotation: new Angle(0),
      }),
      new RunLoop({
        onFrame: (delta) => {
          const time = this.getComponent(Time)!;
          const renderer = this.getComponent(Renderer)!;

          time.tick(delta);
          renderer.render();
        },
      })
    );
  }
}
