import RunLoop from "./RunLoop";
import Entity from "./Entity";

type Data = {
  element: HTMLCanvasElement;
  backgroundColor: string;
};

export default class Canvas extends Entity {
  _element: HTMLCanvasElement;
  _ctx: CanvasRenderingContext2D;
  _runLoop: RunLoop;
  backgroundColor: string;

  constructor(config: Partial<Data> = {}) {
    super();

    this.backgroundColor = config.backgroundColor ?? "white";

    if (config.element) {
      this._element = config.element;
    } else {
      this._element = document.createElement("canvas");
      document.body.appendChild(this._element);
    }

    const ctx = this._element.getContext("2d");
    if (ctx == null) {
      throw new Error("2d drawing context type not supported by browser");
    }
    this._ctx = ctx;

    this._runLoop = new RunLoop((delta: number) => {
      if (!this.isEnabled) return;

      const canvas = this._element;
      const context = this._ctx;

      context.fillStyle = this.backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);

      for (const entity of this.children) {
        entity.update(delta);
      }
      for (const entity of this.children) {
        entity.draw({ canvas, context });
      }
    });

    this._runLoop.start();
  }
}
