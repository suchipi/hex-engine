import Vec2 from "./Vec2";

export default class Grid<T> {
  _kind = "grid";
  size: Vec2;
  data: Array<Array<T>>;
  defaultValue: T;

  constructor(rows: number, columns: number, defaultValue: T) {
    this.data = Array(columns)
      .fill(defaultValue)
      .map(() => Array(rows).fill(defaultValue));

    this.defaultValue = defaultValue;
    this.size = new Vec2(rows, columns);
  }

  setData(data: Array<T>) {
    let currentX = 0;
    let currentY = 0;
    for (const item of data) {
      if (currentX + 1 > this.size.x) {
        currentY++;
        currentX = 0;
      }
      this.set(currentX, currentY, item);
      currentX++;
    }
  }

  get(row: number, column: number): T {
    if (
      row > this.size.x - 1 ||
      row < 0 ||
      column > this.size.y - 1 ||
      column < 0
    ) {
      return this.defaultValue;
    } else {
      return this.data[column][row];
    }
  }

  set(row: number, column: number, value: T): void {
    if (
      row > this.size.x - 1 ||
      row < 0 ||
      column > this.size.y - 1 ||
      column < 0
    ) {
      throw new Error(
        `Attempted to set data into grid of size '${this.size.x}, ${this.size.y}' at out-of-bounds index: ${row}, ${column}`
      );
    } else {
      this.data[column][row] = value;
    }
  }

  *contents(): Generator<[number, number, T]> {
    for (let i = 0; i < this.size.x; i++) {
      for (let j = 0; j < this.size.y; j++) {
        yield [i, j, this.get(i, j)];
      }
    }
  }
}
