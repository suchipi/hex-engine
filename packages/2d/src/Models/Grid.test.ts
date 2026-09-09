/// <reference types="@test-it/core/globals" />
import Grid from "./Grid";
import Vector from "./Vector";

test("a new Grid is filled with the default value", () => {
  const grid = new Grid(2, 3, "empty");

  expect(grid.get(0, 0)).toBe("empty");
  expect(grid.get(1, 2)).toBe("empty");
  expect(grid.defaultValue).toBe("empty");
});

test("size reports rows as x and columns as y", () => {
  const grid = new Grid(2, 3, 0);

  expect(grid.size.x).toBe(2);
  expect(grid.size.y).toBe(3);
});

test("values set at a row and column read back from there", () => {
  const grid = new Grid(3, 3, 0);

  grid.set(1, 2, 42);

  expect(grid.get(1, 2)).toBe(42);
  expect(grid.get(2, 1)).toBe(0);
});

test("get and set also accept a Vector", () => {
  const grid = new Grid(3, 3, 0);

  grid.set(new Vector(1, 2), 42);

  expect(grid.get(new Vector(1, 2))).toBe(42);
  expect(grid.get(1, 2)).toBe(42);
});

test("get throws for anything out of bounds", () => {
  const grid = new Grid(2, 2, "empty");

  expect(() => grid.get(-1, 0)).toThrowError(/out-of-bounds index/);
  expect(() => grid.get(0, -1)).toThrowError(/out-of-bounds index/);
  expect(() => grid.get(2, 0)).toThrowError(/out-of-bounds index/);
  expect(() => grid.get(0, 2)).toThrowError(/out-of-bounds index/);
  expect(() => grid.get(100, 100)).toThrowError(/out-of-bounds index/);
});

test("get and set agree about what is out of bounds", () => {
  const grid = new Grid(2, 2, "empty");

  expect(() => grid.get(5, 5)).toThrowError(/out-of-bounds index/);
  expect(() => grid.set(5, 5, "x")).toThrowError(/out-of-bounds index/);
});

test("setData fills the grid row by row", () => {
  const grid = new Grid(2, 3, 0);

  grid.setData([1, 2, 3, 4, 5, 6]);

  expect(grid.get(0, 0)).toBe(1);
  expect(grid.get(1, 0)).toBe(2);
  expect(grid.get(0, 1)).toBe(3);
  expect(grid.get(1, 1)).toBe(4);
  expect(grid.get(0, 2)).toBe(5);
  expect(grid.get(1, 2)).toBe(6);
});

test("setData leaves the rest of the grid at its default when given fewer values", () => {
  const grid = new Grid(2, 2, 0);

  grid.setData([1, 2]);

  expect(grid.get(0, 0)).toBe(1);
  expect(grid.get(1, 0)).toBe(2);
  expect(grid.get(0, 1)).toBe(0);
});

test("setData throws when given more values than the grid can hold", () => {
  const grid = new Grid(2, 2, 0);

  expect(() => grid.setData([1, 2, 3, 4, 5])).toThrowError(
    /out-of-bounds index/
  );
});

test("contents yields every cell with its row and column", () => {
  const grid = new Grid(2, 2, 0);
  grid.setData([1, 2, 3, 4]);

  expect([...grid.contents()]).toEqual([
    [0, 0, 1],
    [0, 1, 3],
    [1, 0, 2],
    [1, 1, 4],
  ]);
});

test("the Vector constructor overload keeps the default value", () => {
  const grid = new Grid(new Vector(2, 3), "empty");

  expect(grid.size.x).toBe(2);
  expect(grid.size.y).toBe(3);
  expect(grid.defaultValue).toBe("empty");
  expect(grid.get(0, 0)).toBe("empty");
  expect(grid.get(1, 2)).toBe("empty");
});

test("cells hold whatever type they were given", () => {
  const marker = { id: 1 };
  const grid = new Grid<null | { id: number }>(2, 2, null);

  grid.set(0, 0, marker);

  expect(grid.get(0, 0)).toBe(marker);
  expect(grid.get(1, 1)).toBe(null);
});

test("rows and columns are independent, not shared array references", () => {
  const grid = new Grid(2, 2, 0);

  grid.set(0, 0, 9);

  expect(grid.get(0, 1)).toBe(0);
  expect(grid.get(1, 0)).toBe(0);
  expect(grid.get(1, 1)).toBe(0);
});
