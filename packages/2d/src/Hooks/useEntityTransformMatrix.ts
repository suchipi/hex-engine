import { Entity } from "@hex-engine/core";
import { Position, Origin, Rotation, Scale } from "../Components";
import { Vec2, TransformMatrix } from "../Models";

export default function useEntityTransformMatrix(entity: Entity) {
  let matrix = new TransformMatrix();

  const position = entity.getComponent(Position) || new Vec2(0, 0);

  let origin: Vec2 | null = entity.getComponent(Origin);
  if (!origin) origin = new Vec2(0, 0);
  const drawPos = position.subtract(origin).round();
  matrix = matrix.translate(drawPos);

  const rotation = entity.getComponent(Rotation);
  if (rotation) {
    matrix = matrix.translate(origin);
    matrix = matrix.rotate(rotation);
    matrix = matrix.translate(-origin.x, -origin.y);
  }

  const scale = entity.getComponent(Scale);
  if (scale) {
    matrix.scale(scale, origin);
  }

  return matrix;
}
