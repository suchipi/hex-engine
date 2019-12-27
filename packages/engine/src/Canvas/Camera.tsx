import { onDraw, getComponent } from "core";
import Renderer from "./Renderer";
import { Point, Angle } from "../Models";

type Data = {
  position: Point;
  zoom: number;
  rotation: Angle;
};

export default function Camera({ position, zoom, rotation }: Data) {
  const state = {
    position,
    zoom,
    rotation,
  };

  onDraw(
    (_config: {
      canvas: HTMLCanvasElement;
      context: CanvasRenderingContext2D;
    }) => {
      const renderer = getComponent(Renderer)!;
      renderer.translate(-state.position.x, -state.position.y);
      renderer.scale(state.zoom, state.zoom);
      renderer.rotate(-state.rotation.radians);
    }
  );

  return state;
}
