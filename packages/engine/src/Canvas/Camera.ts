import Component, { ComponentConfig } from "../Component";
import Renderer from "./Renderer";
import { Point, Angle } from "../Models";

type Data = {
  position: Point;
  zoom: number;
  rotation: Angle;
};

export default class Camera extends Component {
  position: Point;
  zoom: number;
  rotation: Angle;

  constructor(data: Data & Partial<ComponentConfig>) {
    super(data);
    this.position = data.position;
    this.zoom = data.zoom;
    this.rotation = data.rotation;
  }

  draw(_config: {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
  }) {
    const renderer = this.getComponent(Renderer)!;
    renderer.translate(-this.position.x, -this.position.y);
    renderer.scale(this.zoom, this.zoom);
    renderer.rotate(-this.rotation.radians);
  }
}
