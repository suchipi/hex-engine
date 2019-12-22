export type Point = {
  x: number;
  y: number;
};

export function makePoint(x: number, y: number): Point {
  return { x, y };
}

export function addPoint(first: Point, second: Point): Point {
  return {
    x: first.x + second.x,
    y: first.y + second.y,
  };
}

export function subtractPoint(first: Point, second: Point): Point {
  return {
    x: first.x - second.x,
    y: first.y - second.y,
  };
}

export function equalsPoint(first: Point, second: Point): boolean {
  return first.x === second.x && first.y === second.y;
}

// Calculate the distance between two points.
export function distance(first: Point, second: Point): number {
  return Math.sqrt(
    Math.pow(second.x - first.x, 2) + Math.pow(second.y - first.y, 2)
  );
}
