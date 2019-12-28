import { onUpdate, getComponent } from "@hex-engine/core";
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

  onUpdate(() => {
    const renderer = getComponent(Renderer)!;

    renderer.translation = new Point(0, 0).subtract(position);
    renderer.scale = new Point(state.zoom, state.zoom);
    renderer.rotation = new Angle(-state.rotation.radians);
  });

  return state;
}
