/// <reference types="@test-it/core/globals" />
import Polygon from "./Polygon";
import Vector from "./Vector";

const xy = (vector: Vector) => ({ x: vector.x, y: vector.y });

test("the constructor recenters the points around their centroid", () => {
  const polygon = new Polygon([
    new Vector(0, 0),
    new Vector(10, 0),
    new Vector(10, 10),
    new Vector(0, 10),
  ]);

  expect(polygon.points.map(xy)).toEqual([
    { x: -5, y: -5 },
    { x: 5, y: -5 },
    { x: 5, y: 5 },
    { x: -5, y: 5 },
  ]);
});

test("recentering does not depend on where the points started", () => {
  const atOrigin = new Polygon([
    new Vector(0, 0),
    new Vector(10, 0),
    new Vector(10, 10),
    new Vector(0, 10),
  ]);
  const faraway = new Polygon([
    new Vector(100, 200),
    new Vector(110, 200),
    new Vector(110, 210),
    new Vector(100, 210),
  ]);

  expect(faraway.points.map(xy)).toEqual(atOrigin.points.map(xy));
});

test("width and height are the extents of the points", () => {
  const polygon = new Polygon([
    new Vector(0, 0),
    new Vector(40, 0),
    new Vector(40, 10),
    new Vector(0, 10),
  ]);

  expect(polygon.width).toBe(40);
  expect(polygon.height).toBe(10);
});

test("rectangle builds a polygon of the requested size", () => {
  const fromNumbers = Polygon.rectangle(40, 10);
  const fromVector = Polygon.rectangle(new Vector(40, 10));

  expect(fromNumbers.width).toBe(40);
  expect(fromNumbers.height).toBe(10);
  expect(fromVector.points.map(xy)).toEqual(fromNumbers.points.map(xy));
});

test("a rectangle's points are centered on the origin", () => {
  expect(Polygon.rectangle(40, 20).points.map(xy)).toEqual([
    { x: -20, y: -10 },
    { x: 20, y: -10 },
    { x: 20, y: 10 },
    { x: -20, y: 10 },
  ]);
});

test("assigning points recenters them and recomputes the size", () => {
  const polygon = Polygon.rectangle(10, 10);

  polygon.points = [
    new Vector(0, 0),
    new Vector(20, 0),
    new Vector(20, 40),
    new Vector(0, 40),
  ];

  expect(polygon.width).toBe(20);
  expect(polygon.height).toBe(40);
  expect(polygon.points.map(xy)).toEqual([
    { x: -10, y: -20 },
    { x: 10, y: -20 },
    { x: 10, y: 20 },
    { x: -10, y: 20 },
  ]);
});

test("the width setter scales the points horizontally only", () => {
  const polygon = Polygon.rectangle(10, 10);

  polygon.width = 20;

  expect(polygon.width).toBe(20);
  expect(polygon.height).toBe(10);
});

test("the height setter scales the points vertically only", () => {
  const polygon = Polygon.rectangle(10, 10);

  polygon.height = 40;

  expect(polygon.width).toBe(10);
  expect(polygon.height).toBe(40);
});

test("the width and height setters ignore NaN", () => {
  const polygon = Polygon.rectangle(10, 20);

  polygon.width = NaN;
  polygon.height = NaN;

  expect(polygon.width).toBe(10);
  expect(polygon.height).toBe(20);
});

test("known quirk: resizing a zero-width polygon turns its points into NaN", () => {
  const polygon = new Polygon([
    new Vector(0, 0),
    new Vector(0, 10),
    new Vector(0, 20),
  ]);

  expect(polygon.width).toBe(0);

  // The setter scales by `newWidth / this.width`, and the NaN guard only checks
  // the value passed in, not the ratio it produces.
  polygon.width = 10;

  expect(Number.isNaN(polygon.points[0].x)).toBe(true);
  expect(Number.isNaN(polygon.width)).toBe(true);
});

test("containsPoint is true inside and false outside", () => {
  const polygon = Polygon.rectangle(40, 20);

  expect(polygon.containsPoint(new Vector(0, 0))).toBe(true);
  expect(polygon.containsPoint(new Vector(19, 9))).toBe(true);
  expect(polygon.containsPoint(new Vector(-19, -9))).toBe(true);
  expect(polygon.containsPoint(new Vector(21, 0))).toBe(false);
  expect(polygon.containsPoint(new Vector(0, 11))).toBe(false);
});

test("containsPoint treats the top and left edges as inside, and the bottom and right as outside", () => {
  const polygon = Polygon.rectangle(40, 20);

  expect(polygon.containsPoint(new Vector(-20, 0))).toBe(true);
  expect(polygon.containsPoint(new Vector(0, -10))).toBe(true);
  expect(polygon.containsPoint(new Vector(20, 0))).toBe(false);
  expect(polygon.containsPoint(new Vector(0, 10))).toBe(false);
});

test("containsPoint handles a non-convex polygon", () => {
  // An L shape, 30 wide and 30 tall, with the top-right quadrant missing.
  const polygon = new Polygon([
    new Vector(0, 0),
    new Vector(15, 0),
    new Vector(15, 15),
    new Vector(30, 15),
    new Vector(30, 30),
    new Vector(0, 30),
  ]);

  const centroidX = 15;
  const centroidY = 15;
  const at = (x: number, y: number) =>
    polygon.containsPoint(new Vector(x - centroidX, y - centroidY));

  expect(at(5, 25)).toBe(true);
  expect(at(25, 25)).toBe(true);
  // Inside the bounding box, but in the missing corner.
  expect(at(25, 5)).toBe(false);
});

test("boundingRectangle matches the polygon's own width and height", () => {
  const polygon = new Polygon([
    new Vector(0, 0),
    new Vector(30, 10),
    new Vector(10, 30),
  ]);

  const bounds = polygon.boundingRectangle();

  expect(bounds.width).toBe(polygon.width);
  expect(bounds.height).toBe(polygon.height);
});

test("equals compares the points position by position", () => {
  expect(Polygon.rectangle(10, 10).equals(Polygon.rectangle(10, 10))).toBe(
    true
  );
  expect(Polygon.rectangle(10, 10).equals(Polygon.rectangle(10, 20))).toBe(
    false
  );
});

test("draw fills the polygon's area", () => {
  const canvas = document.createElement("canvas");
  canvas.width = 60;
  canvas.height = 60;

  const context = canvas.getContext("2d")!;
  context.fillStyle = "red";
  Polygon.rectangle(20, 20).draw(context, "fill");

  const isRed = (x: number, y: number) => {
    const [r, g, b] = context.getImageData(x, y, 1, 1).data;
    return r > 200 && g < 50 && b < 50;
  };

  // Like Circle, draw offsets by half the size, so the shape spans 0..20.
  expect(isRed(10, 10)).toBe(true);
  expect(isRed(30, 30)).toBe(false);
});
