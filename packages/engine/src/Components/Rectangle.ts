import Component from "./Component";

type Data = {
  width: number;
  height: number;
  color: string;
};

export default class Rectangle extends Component<Data> {
  defaults() {
    return {
      width: 100,
      height: 100,
      color: "red",
    };
  }

  draw({
    context,
  }: {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
  }): void {
    const position = this.getComponent("position");
    if (!position) return;
    const { x, y } = position.data;
    const { width, height, color } = this.data;

    context.fillStyle = color;
    context.fillRect(x, y, width, height);
  }
}
