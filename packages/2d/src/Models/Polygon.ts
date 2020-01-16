import Point from "./Point";
import LineSegment from "./LineSegment";

/**
 * Represents a closed shape consisting of a set of connected straight line segments.
 */
export default class Polygon {
  /**
   * Points representing the corners where the polygon's line segments meet.
   * Their `x` and `y` properties refer to their position relative to the
   * polygon's [centroid](https://en.wikipedia.org/wiki/Centroid).
   *
   * The points are ordered such that one could draw the polygon by
   * placing a pen down at the first point, then dragging the pen in a straight line
   * to the second point, then the third, and so on until the last point,
   * which is connected to the first point.
   * */
  readonly points: Array<Point>;

  /**
   * The distance between the leftmost point in the polygon and the rightmost point on the polygon.
   */
  readonly width: number;

  /**
   * The distance between the highest point in the polygon and the lowest point on the polygon.
   */
  readonly height: number;

  /**
   * All the line segments that this polygon is made out of. Note that a Polygon is a *closed* shape,
   * so there will be an equivalent number of line segments as there are points in the polygon,
   * because the last point in the polygon is connected to the first point.
   */
  readonly lineSegments: Array<LineSegment>;

  /**
   * @param points Points representing the corners where the polygon's line segments meet.
   *
   * The points are ordered such that one could draw the polygon by
   * placing a pen down at the first point, then dragging the pen in a straight line
   * to the second point, then the third, and so on until the last point,
   * which is connected to the first point.
   *
   * Note that the x and y values on the points on the created Polygon
   * may not be the same as the x and y values on the points you give here,
   * because the constructor calculates the centroid of the polygon and then
   * recenters all points around it.
   */
  constructor(points: Array<Point>) {
    const centroid = points
      .reduce((prev, curr) => prev.addMutate(curr), new Point(0, 0))
      .divideMutate(points.length);

    this.points = points.map((point) => centroid.subtract(point));

    const minX = this.points.reduce(
      (prev, point) => Math.min(point.x, prev),
      0
    );
    const maxX = this.points.reduce(
      (prev, point) => Math.max(point.x, prev),
      0
    );

    this.width = maxX - minX;

    const minY = this.points.reduce(
      (prev, point) => Math.min(point.y, prev),
      0
    );
    const maxY = this.points.reduce(
      (prev, point) => Math.max(point.y, prev),
      0
    );

    this.height = maxY - minY;

    const lineSegments: Array<LineSegment> = [];
    this.points.reduce((prev, current) => {
      lineSegments.push(new LineSegment(prev, current));

      return current;
    }, this.points[this.points.length - 1]);

    this.lineSegments = lineSegments.slice(1).concat(lineSegments[0]);
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

  /**
   * Creates a rectangular polygon whose width and height match that of this polygon;
   * said in other words, returns the rectangle that this polygon could be perfectly
   * [inscribed](https://www.mathopenref.com/inscribed.html) in.
   */
  boundingRectangle(): Polygon {
    return Polygon.rectangle(this.width, this.height);
  }

  // TODO: this isn't working right
  containsPoint(point: Point) {
    // Based on description of ray casting algorithm from https://en.wikipedia.org/wiki/Point_in_polygon on Jan 16 2020
    const intersectingRay = new LineSegment(
      point,
      point.add(new Point(0, 9999999))
    );
    let intersections = 0;
    for (const lineSegment of this.lineSegments) {
      if (lineSegment.intersectsWith(intersectingRay)) {
        intersections++;
      }
    }
    return intersections % 2 !== 0;
  }

  equals(other: Polygon) {
    return this.points.every((point, index) => {
      const otherPoint = other.points[index];
      return otherPoint && point.equals(otherPoint);
    });
  }
}
