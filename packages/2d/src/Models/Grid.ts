import Vector from "./Vector";

/**
 * Represents a two-dimensional Grid with arbitrary contents in
 * each cell.
 */
export default class Grid<T> {
  _kind = "grid";

  /** The size of the grid, in rows and columns. */
  size: Vector;

  private data: Array<Array<T>>;

  /** The default value to initialize empty cells with. */
  defaultValue: T;

  constructor(rows: number, columns: number, defaultValue: T);
  constructor(rowsAndCols: Vector, defaultValue: T);
  constructor(
    rowsOrRowsAndCols: number | Vector,
    columnsOrDefaultValue: number | T,
    maybeDefaultValue?: T
  ) {
    let rows: number, columns: number, defaultValue: T;
    if (
      typeof rowsOrRowsAndCols === "number" &&
      typeof columnsOrDefaultValue === "number"
    ) {
      rows = rowsOrRowsAndCols;
      columns = columnsOrDefaultValue;
      defaultValue = maybeDefaultValue!;
    } else {
      rows = (rowsOrRowsAndCols as Vector).x;
      columns = (rowsOrRowsAndCols as Vector).y;
      defaultValue = maybeDefaultValue as T;
    }

    this.data = Array(columns)
      .fill(defaultValue)
      .map(() => Array(rows).fill(defaultValue));

    this.defaultValue = defaultValue;
    this.size = new Vector(rows, columns);
  }

  /** Fill in the grid with the provided data, represented as a 2D array. */
  setData(data: Array<T>): void {
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

  /** Get the value in the cell at the given row and column index. */
  get(row: number, column: number): T;
  get(pos: Vector): T;
  get(rowOrPos: number | Vector, maybeColumn?: number) {
    let row: number, column: number;
    if (typeof rowOrPos === "number" && typeof maybeColumn === "number") {
      row = rowOrPos;
      column = maybeColumn;
    } else {
      row = (rowOrPos as Vector).x;
      column = (rowOrPos as Vector).y;
    }

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

  /** Set the value in the cell at the given row and column index. */
  set(row: number, column: number, value: T): void;
  set(pos: Vector, value: T): void;
  set(rowOrPos: number | Vector, columnOrValue: number | T, maybeValue?: T) {
    let row: number, column: number, value: T;
    if (typeof rowOrPos === "number" && typeof columnOrValue === "number") {
      row = rowOrPos;
      column = columnOrValue;
      value = maybeValue!;
    } else {
      row = (rowOrPos as Vector).x;
      column = (rowOrPos as Vector).y;
      value = columnOrValue as T;
    }

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

  /** Returns an iterable of all the contents of this grid and their row and column indices. */
  *contents(): Generator<[number, number, T]> {
    for (let i = 0; i < this.size.x; i++) {
      for (let j = 0; j < this.size.y; j++) {
        yield [i, j, this.get(i, j)];
      }
    }
  }
}
