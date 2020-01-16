import Point from "./Point";

/**
 * Represents a shape consisting of a set of connected straight line segments.
 */
export default class Polygon {
  /**
   * Points representing the corners where the polygon's line segments meet.
   * Their `x` and `y` properties refer to their position relative to the
   * polygon's [centroid](https://en.wikipedia.org/wiki/Centroid).
   *
   * The points are ordered such that one could draw the polygon by
   * placing a pen down at the first point, then dragging the pen in a straight line
   * to the second point, then the third, and so on.
   * */
  readonly points: Array<Point>;

  /**
   * @param points Points representing the corners where the polygon's line segments meet.
   * The points are ordered such that one could draw the polygon by
   * placing a pen down at the first point, then dragging the pen in a straight line
   * to the second point, then the third, and so on.
   *
   * Note that the x and y properties on the
   * points on the created Polygon probably won't be the same as the points you
   * input here, because the constructor calculates the centroid of the polygon
   * and then recenters all points around it.
   */
  constructor(points: Array<Point>) {
    const centroid = points
      .reduce((prev, curr) => prev.addMutate(curr), new Point(0, 0))
      .divideMutate(points.length);

    this.points = points.map((point) => centroid.subtract(point));
  }

  /**
   * Creates a rectangular polygon; a 4-sided polygon where the angles between all sides are all π/2 radians (90 degrees).
   * @param size A Point whose `x` and `y` properties refer to the desired width and height of the new rectangle.
   */
  static rectangle(size: Point): Polygon;
  /**
   * Creates a rectangular polygon; a 4-sided polygon where the angles between all sides are all π/2 radians (90 degrees).
   * @param width The desired width of the new rectangle.
   * @param height The desired height of the new rectangle.
   */
  static rectangle(width: number, height: number): Polygon;
  static rectangle(widthOrSize: Point | number, maybeHeight?: number): Polygon {
    let width: number, height: number;
    if (typeof widthOrSize === "number" && typeof maybeHeight === "number") {
      width = widthOrSize;
      height = maybeHeight;
    } else {
      width = (widthOrSize as Point).x;
      height = (widthOrSize as Point).y;
    }

    return new Polygon([
      new Point(0, 0),
      new Point(width, 0),
      new Point(width, height),
      new Point(0, height),
    ]);
  }
}
