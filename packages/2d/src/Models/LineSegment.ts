import Point from "./Point";

// Lots of code here is adapted from https://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/

export default class LineSegment {
  start: Point;
  end: Point;

  constructor(start: Point, end: Point) {
    this.start = start;
    this.end = end;
  }

  intersectsWith(other: LineSegment) {
    const p1 = this.start;
    const p2 = this.end;
    const q1 = other.start;
    const q2 = other.end;

    // Find the four orientations needed for general and
    // special cases
    const o1 = tripletOrientation(p1, q1, p2);
    const o2 = tripletOrientation(p1, q1, q2);
    const o3 = tripletOrientation(p2, q2, p1);
    const o4 = tripletOrientation(p2, q2, q1);

    // General case
    if (o1 != o2 && o3 != o4) return true;

    // Special Cases
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;

    // p1, q1 and q2 are colinear and q2 lies on segment p1q1
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;

    // p2, q2 and p1 are colinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;

    // p2, q2 and q1 are colinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;

    return false; // Doesn't fall in any of the above cases
  }
}

// 0 --> p, q and r are colinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function tripletOrientation(p: Point, q: Point, r: Point): number {
  // See https://www.geeksforgeeks.org/orientation-3-ordered-points/
  // for details of below formula.
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

  if (val == 0) return 0; // colinear

  return val > 0 ? 1 : 2; // clock or counterclock wise
}

// Given three colinear points p, q, r, checks if
// point q lies on line segment 'pr'
function onSegment(p: Point, q: Point, r: Point): boolean {
  return (
    q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)
  );
}
