/// <reference types="@test-it/core/globals" />
import Circle from "./Circle";
import Vector from "./Vector";

test("radius is whatever it was constructed with", () => {
  expect(new Circle(10).radius).toBe(10);
});

test("diameter, width, and height all read as twice the radius", () => {
  const circle = new Circle(10);

  expect(circle.diameter).toBe(20);
  expect(circle.width).toBe(20);
  expect(circle.height).toBe(20);
});

test("setting the diameter halves it into the radius", () => {
  const circle = new Circle(10);

  circle.diameter = 10;

  expect(circle.radius).toBe(5);
  expect(circle.diameter).toBe(10);
});

test("setting the width halves it into the radius", () => {
  const circle = new Circle(10);

  circle.width = 10;

  expect(circle.radius).toBe(5);
  expect(circle.width).toBe(10);
});

test("setting the height halves it into the radius", () => {
  const circle = new Circle(10);

  circle.height = 10;

  expect(circle.radius).toBe(5);
  expect(circle.height).toBe(10);
});

test("the size properties round-trip through their setters", () => {
  const circle = new Circle(1);

  circle.diameter = 30;
  expect(circle.diameter).toBe(30);

  circle.width = 42;
  expect(circle.width).toBe(42);

  circle.height = 7;
  expect(circle.height).toBe(7);
});

test("containsPoint measures from the origin, not from any position on the circle", () => {
  const circle = new Circle(10);

  expect(circle.containsPoint(new Vector(0, 0))).toBe(true);
  expect(circle.containsPoint(new Vector(9, 0))).toBe(true);
  expect(circle.containsPoint(new Vector(0, -9))).toBe(true);
  expect(circle.containsPoint(new Vector(11, 0))).toBe(false);
  expect(circle.containsPoint(new Vector(8, 8))).toBe(false);
});

test("containsPoint counts a point exactly on the edge as inside", () => {
  const circle = new Circle(10);

  expect(circle.containsPoint(new Vector(10, 0))).toBe(true);
  expect(circle.containsPoint(new Vector(0, 10))).toBe(true);
});

test("containsPoint does not mutate the point it is given", () => {
  const circle = new Circle(10);
  const point = new Vector(3, 4);

  circle.containsPoint(point);

  expect(point.x).toBe(3);
  expect(point.y).toBe(4);
});

test("equals compares radius only", () => {
  expect(new Circle(10).equals(new Circle(10))).toBe(true);
  expect(new Circle(10).equals(new Circle(11))).toBe(false);
});

test("boundingRectangle is a square of the circle's diameter", () => {
  const rectangle = new Circle(10).boundingRectangle();

  expect(rectangle.width).toBe(20);
  expect(rectangle.height).toBe(20);
});

test("draw puts the circle's center one radius in from the top-left", () => {
  const canvas = document.createElement("canvas");
  canvas.width = 40;
  canvas.height = 40;

  const context = canvas.getContext("2d")!;
  context.fillStyle = "red";
  new Circle(10).draw(context, "fill");

  const isRed = (x: number, y: number) => {
    const [r, g, b] = context.getImageData(x, y, 1, 1).data;
    return r > 200 && g < 50 && b < 50;
  };

  // Drawing at 0,0 offsets by width/2, so the circle spans 0..20 on both axes.
  expect(isRed(10, 10)).toBe(true);
  expect(isRed(1, 10)).toBe(true);
  expect(isRed(19, 10)).toBe(true);
  expect(isRed(25, 10)).toBe(false);
  expect(isRed(10, 25)).toBe(false);
});

test("draw accepts an offset that shifts the whole circle", () => {
  const canvas = document.createElement("canvas");
  canvas.width = 60;
  canvas.height = 60;

  const context = canvas.getContext("2d")!;
  context.fillStyle = "red";
  new Circle(10).draw(context, "fill", { x: 20, y: 20 });

  const isRed = (x: number, y: number) => {
    const [r, g, b] = context.getImageData(x, y, 1, 1).data;
    return r > 200 && g < 50 && b < 50;
  };

  expect(isRed(30, 30)).toBe(true);
  expect(isRed(10, 10)).toBe(false);
});
