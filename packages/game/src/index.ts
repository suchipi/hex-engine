import { Entity, Canvas } from "engine";

const parent = new Entity();
const child = new Entity();

parent.addChild(child);

const canvas = new Canvas();

canvas.addChild(parent);
