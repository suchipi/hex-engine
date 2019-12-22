import { Point } from "./Point";
import { makeVector, vectorToPoint } from "./Vector";

export type Angle = {
  // Radians in canvas-style polar coordinate space;
  // which is like normal polar coordinate space but
  // the y-component is inverted, to match the
  // "0,0 is upper-left corner, y increases as
  // you go down" property of a canvas. So angle
  // increases as you go clockwise, decreases as
  // you go counter-clockwise.
  //
  //           , - ~ ~ ~ - ,
  //       , '     3π/2      ' ,
  //     ,                       ,
  //    ,                         ,
  //   ,                           ,
  //   , π           .------------ , 0 or 2π
  //   ,                    ,      ,
  //    ,                  /      ,
  //     ,            < - '      ,
  //       ,        π/2       , '
  //         ' - , _ _ _ ,  '
  //
  radians: number;
};

export function makeAngle(radians: number): Angle {
  return {
    radians,
  };
}

// Calculate the position of the head of a unit vector with the given angle
// whose tail is at the origin.
export function angleToPoint(angle: Angle): Point {
  const vector = makeVector(angle, 1);
  return vectorToPoint(vector);
}

// Calculate the angle of the vector whose tail is at `first` and whose head
// is at `second`.
export function pointsToAngle(first: Point, second: Point): Angle {
  const deltaX = second.x - first.x;
  const deltaY = second.y - first.y;
  // Invert y component because JS math functions
  // assume normal polar coordinate space
  const radians = Math.atan2(-deltaY, deltaX);
  return makeAngle(radians);
}
