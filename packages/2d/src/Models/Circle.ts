import Point from "./Point";
import Polygon from "./Polygon";

/**
 * Represents a circle; a shape with infinite points along its edge that are all equidistant from its center.
 * The distance between the center and the edge points is known as the circle's radius.
 */
export default class Circle {
  readonly radius: number;

  readonly diameter: number;
  readonly width: number;
  readonly height: number;

  readonly origin: Point = new Point(0, 0);

  constructor(radius: number) {
    this.radius = radius;
    this.diameter = this.width = this.height = radius * 2;
  }

  /**
   * Creates a rectangular polygon whose width and height are double this circle's radius;
   * said in other words, returns the rectangle that this circle could be perfectly
   * [inscribed](https://www.mathopenref.com/inscribed.html) in.
   */
  boundingRectangle(): Polygon {
    return Polygon.rectangle(this.width, this.height);
  }

  /**
   * Returns whether a given point is within the circle, or on the circle's edge.
   * @param point The point for which we want to check whether it's inside the circle.
   */
  containsPoint(point: Point): boolean {
    const distance = point.distanceTo(this.origin);
    return distance <= this.radius;
  }

  equals(other: Circle) {
    return this.radius === other.radius;
  }
}
