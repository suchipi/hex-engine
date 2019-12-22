import { Point, makePoint, distance } from "./Point";
import { Angle, pointsToAngle } from "./Angle";

export type Vector = {
  angle: Angle;
  magnitude: number;
};

export function makeVector(angle: Angle, magnitude: number): Vector {
  return {
    angle,
    magnitude,
  };
}

// Place a vector at the origin, and return the location of its head.
export function vectorToPoint(vector: Vector): Point {
  const x = vector.magnitude * Math.cos(vector.angle.radians);
  const y = vector.magnitude * Math.sin(vector.angle.radians);
  return makePoint(x, y);
}

// Create a vector with tail at `first` and head at `second`.
export function pointsToVector(first: Point, second: Point): Vector {
  const angle = pointsToAngle(first, second);
  const magnitude = distance(first, second);
  return makeVector(angle, magnitude);
}
