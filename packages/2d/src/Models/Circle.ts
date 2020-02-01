import Vector from "./Vector";
import Polygon from "./Polygon";

const origin = new Vector(0, 0);

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
  radius: number;

  /**
   * The diameter of this circle; the length of a line segment that starts at
   * the circle's edge, crosses through the circle's center, and continues to
   * the opposite edge.
   */
  get diameter() {
    return this.radius * 2;
  }
  set diameter(newValue: number) {
    this.radius = newValue * 2;
  }

  /**
   * The width of this circle; same as the diameter.
   */
  get width() {
    return this.radius * 2;
  }
  set width(newValue: number) {
    this.radius = newValue * 2;
  }

  /**
   * The height of this circle; same as the diameter.
   */
  get height() {
    return this.radius * 2;
  }
  set height(newValue: number) {
    this.radius = newValue * 2;
  }

  constructor(radius: number) {
    this.radius = radius;
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
   * Returns a value indicating if a given point is either within the circle or on the its edge.
   * @param point The point to check.
   */
  containsPoint(point: Vector): boolean {
    const distance = point.distanceTo(origin);
    return distance <= this.radius;
  }

  /**
   * Returns whether this circle has the same radius as another.
   * @param other The other circle to compare to.
   */
  equals(other: Circle): boolean {
    return this.radius === other.radius;
  }

  /**
   * Draws this circle onto a canvas context, using the current stroke or fill style.
   * @param context The canvas context to draw onto.
   * @param strokeOrFill Whether to use `context.stroke` or `context.fill` to draw the circle.
   */
  draw(
    context: CanvasRenderingContext2D,
    strokeOrFill: "stroke" | "fill",
    { x = 0, y = 0 }: { x?: number | undefined; y?: number | undefined } = {}
  ) {
    const xOffset = this.width / 2 + x;
    const yOffset = this.height / 2 + y;

    context.beginPath();
    context.arc(xOffset, yOffset, this.radius, 0, 2 * Math.PI);
    if (strokeOrFill === "stroke") {
      context.stroke();
    } else {
      context.fill();
    }
    context.closePath();
  }
}
