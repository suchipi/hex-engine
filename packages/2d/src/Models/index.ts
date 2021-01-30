import Circle from "./Circle";
import Grid from "./Grid";
import Vector, { ReadOnlyVector /* @babel-remove-prev-node */ } from "./Vector";
import Polygon from "./Polygon";
import TransformMatrix from "./TransformMatrix";

type Shape = Circle | Polygon;

// NOTE: You have to put a babel-remove-prev-node pragma comment after each
// type-only export, otherwise there ends up being issues with the build later.
export {
  Circle,
  Grid,
  Vector,
  ReadOnlyVector /* @babel-remove-prev-node */,
  Polygon,
  Shape,
  TransformMatrix,
};
