import Point from "./Point";
import Polygon from "./Polygon";

const origin = new Point(0, 0);

/**
 * Represents a circle; a shape with infinite points along its edge that are all
 * equidistant from its center.
 *
 * The distance between the center and the edge points is known as the circle's
 * radius.
 */
export default class Circle {
  /**
   * The radius of this circle; the length of a line segment that starts at the
   * circle's center and goes to its edge.
   */
  readonly radius: number;

  /**
   * The diameter of this circle; the length of a line segment that starts at
   * the circle's edge, crosses through the circle's center, and continues to
   * the opposite edge.
   */
  readonly diameter: number;

  /**
   * The width of this circle; same as the diameter.
   */
  readonly width: number;

  /**
   * The height of this circle; same as the diameter.
   */
  readonly height: number;

  /**
   * The size of the bounding rectangle around this circle.
   */
  readonly bounds: Point;

  constructor(radius: number) {
    this.radius = radius;
    this.diameter = this.width = this.height = radius * 2;
    this.bounds = new Point(this.width, this.height);
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
    const distance = point.distanceTo(origin);
    return distance <= this.radius;
  }

  /**
   * Returns whether this circle has the same radius as another.
   * @param other The other circle to compare to.
   */
  equals(other: Circle) {
    return this.radius === other.radius;
  }

  /**
   * Draws this polygon onto a canvas context, using the current stroke style.
   * @param context The canvas context to draw onto.
   */
  draw(
    context: CanvasRenderingContext2D,
    strokeOrFill: "stroke" | "fill",
    { x = 0, y = 0 }: { x?: number | undefined; y?: number | undefined } = {}
  ) {
    const xOffset = this.width / 2 + x;
    const yOffset = this.height / 2 + y;

    context.arc(xOffset, yOffset, this.radius, 0, 2 * Math.PI);
    if (strokeOrFill === "stroke") {
      context.stroke();
    } else {
      context.fill();
    }
  }
}
