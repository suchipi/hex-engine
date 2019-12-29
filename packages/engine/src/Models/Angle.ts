import Vec2 from "./Vec2";
import Vector from "./Vector";

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
export default class Angle {
  radians: number;

  constructor(radians: number) {
    this.radians = radians;
  }

  // Calculate the angle of the vector whose tail is at `first` and whose head
  // is at `second`.
  static fromPoints(first: Vec2, second: Vec2): Angle {
    const deltaX = second.x - first.x;
    const deltaY = second.y - first.y;
    // Invert y component because JS math functions
    // assume normal polar coordinate space
    const radians = Math.atan2(-deltaY, deltaX);
    return new Angle(radians);
  }

  // Calculate the position of the head of a unit vector with the given angle
  // whose tail is at the origin.
  toVec2(): Vec2 {
    const vector = new Vector(this, 1);
    return vector.toVec2();
  }

  add(amount: number) {
    return new Angle(this.radians + amount);
  }

  subtract(amount: number) {
    return new Angle(this.radians - amount);
  }
}
