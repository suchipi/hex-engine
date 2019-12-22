import { Entity, Canvas } from "engine";

const ent = new Entity({
  position: {
    x: 0,
    y: 0,
    z: 0,
  },
  rectangle: {
    color: "blue",
    height: 100,
    width: 100,
  },
});

const canvas = new Canvas();

canvas.addChild(ent);
