import Vector from "./Vector";

export function createSVGMatrix(): DOMMatrix {
  const matrix = window.DOMMatrix
    ? new DOMMatrix()
    : document.createElementNS("http://www.w3.org/2000/svg", "g").getCTM();
  if (matrix == null) {
    throw new Error(
      "Unable to create transformation matrix. Maybe try using a newer browser?"
    );
  }
  return matrix;
}

/** Represents a 2-dimensional transformation matrix. */
export default class TransformMatrix {
  static IDENTITY = new TransformMatrix();

  _matrix: DOMMatrix;

  /** Create a TransformMatrix from a DOMMatrix of SVGMatrix. */
  static fromDOMMatrix(domMatrix: DOMMatrix): TransformMatrix {
    const { a, b, c, d, e, f } = domMatrix;
    return new TransformMatrix(a, b, c, d, e, f);
  }

  constructor();
  constructor(a: number, b: number, c: number, d: number, e: number, f: number);
  constructor(...args: Array<any>) {
    this._matrix = createSVGMatrix();
    if (args.length === 6) {
      const [a, b, c, d, e, f] = args;
      Object.assign(this._matrix, {
        a,
        b,
        c,
        d,
        e,
        f,
      });
    }
  }

  /** Creates a new TransformMatrix with the same values as this one, but with a scale operation applied. */
  scale(size: Vector, origin: Vector): TransformMatrix;
  scale(
    sizeX: number,
    sizeY: number,
    originX: number,
    originY: number
  ): TransformMatrix;
  scale(...args: Array<any>): TransformMatrix {
    let sizeX: number, sizeY: number, originX: number, originY: number;
    if (args.length === 2) {
      sizeX = args[0].x;
      sizeY = args[0].y;
      originX = args[1].x;
      originY = args[1].y;
    } else {
      sizeX = args[0];
      sizeY = args[1];
      originX = args[2];
      originY = args[3];
    }

    return TransformMatrix.fromDOMMatrix(
      this._matrix.scale(sizeX, sizeY, undefined, originX, originY, undefined)
    );
  }

  /** Mutates this TransformMatrix by applying a scale operation. */
  scaleMutate(size: Vector, origin: Vector): this;
  scaleMutate(
    sizeX: number,
    sizeY: number,
    originX: number,
    originY: number
  ): this;
  scaleMutate(...args: Array<any>): this {
    let sizeX: number, sizeY: number, originX: number, originY: number;
    if (args.length === 2) {
      sizeX = args[0].x;
      sizeY = args[0].y;
      originX = args[1].x;
      originY = args[1].y;
    } else {
      sizeX = args[0];
      sizeY = args[1];
      originX = args[2];
      originY = args[3];
    }

    if (typeof this._matrix.scaleSelf === "function") {
      this._matrix.scaleSelf(
        sizeX,
        sizeY,
        undefined,
        originX,
        originY,
        undefined
      );
    } else {
      this._matrix = this._matrix.scale(
        sizeX,
        sizeY,
        undefined,
        originX,
        originY,
        undefined
      );
    }

    return this;
  }

  /** Creates a new TransformMatrix with the same values as this one, but with a translation applied. */
  translate(pos: Vector): TransformMatrix;
  translate(x: number, y: number): TransformMatrix;
  translate(posOrX: Vector | number, maybeY?: number): TransformMatrix {
    let x: number, y: number;
    if (typeof posOrX === "number") {
      x = posOrX;
      y = maybeY!;
    } else {
      x = (posOrX as Vector).x;
      y = (posOrX as Vector).y;
    }

    return TransformMatrix.fromDOMMatrix(this._matrix.translate(x, y));
  }

  /** Mutates this TransformMatrix by applying a translation. */
  translateMutate(pos: Vector): this;
  translateMutate(x: number, y: number): this;
  translateMutate(posOrX: Vector | number, maybeY?: number): this {
    let x: number, y: number;
    if (typeof posOrX === "number") {
      x = posOrX;
      y = maybeY!;
    } else {
      x = (posOrX as Vector).x;
      y = (posOrX as Vector).y;
    }

    if (typeof this._matrix.translateSelf === "function") {
      this._matrix.translateSelf(x, y);
    } else {
      this._matrix = this._matrix.translate(x, y);
    }

    return this;
  }

  /** Creates a new TransformMatrix with the same values as this one, but with a rotation applied. */
  rotate(radians: number): TransformMatrix {
    // canvas `rotate` uses radians, DOMMatrix uses degrees.
    const degrees = (radians * 180) / Math.PI;

    return TransformMatrix.fromDOMMatrix(this._matrix.rotate(degrees));
  }

  /** Mutates this TransformMatrix by applying a rotation. */
  rotateMutate(radians: number): this {
    // canvas `rotate` uses radians, DOMMatrix uses degrees.
    const degrees = (radians * 180) / Math.PI;

    if (typeof this._matrix.rotateSelf === "function") {
      this._matrix.rotateSelf(degrees);
    } else {
      this._matrix = this._matrix.rotate(degrees);
    }

    return this;
  }

  /** Creates a new TransformMatrix by multiplying this one with another. */
  multiply(other: TransformMatrix | DOMMatrix): TransformMatrix {
    const otherDomMatrix =
      other instanceof TransformMatrix ? other._matrix : other;

    return TransformMatrix.fromDOMMatrix(this._matrix.multiply(otherDomMatrix));
  }

  /** Mutates this TransformMatrix by multiplying it with another. */
  multiplyMutate(other: TransformMatrix | DOMMatrix): this {
    const otherDomMatrix =
      other instanceof TransformMatrix ? other._matrix : other;

    if (typeof this._matrix.multiplySelf === "function") {
      this._matrix.multiplySelf(otherDomMatrix);
    } else {
      this._matrix = this._matrix.multiply(otherDomMatrix);
    }

    return this;
  }

  /**
   * Applies this TransformMatrix's transform to the provided Vector values, and returns a new Vector.
   *
   * This does *not* mutate the provided Vector.
   */
  transformPoint(point: Vector): Vector {
    const domPoint = point.asDOMPoint().matrixTransform(this._matrix);
    return new Vector(domPoint.x, domPoint.y);
  }

  /**
   * Applies this TransformMatrix's transform to the provided Vector values, and mutates the provided Vector to contain the transformed values.
   */
  transformPointMutate(point: Vector): Vector {
    const domPoint = point.asDOMPoint().matrixTransform(this._matrix);
    point.mutateInto(domPoint);
    return point;
  }

  /** Return a new TransformMatrix that applies the inverse transformation as this one. */
  inverse(): TransformMatrix {
    return TransformMatrix.fromDOMMatrix(this._matrix.inverse());
  }

  /** Mutate this TransformMatrix by inverting its transformation. */
  inverseMutate(): this {
    if (typeof this._matrix.invertSelf === "function") {
      this._matrix.invertSelf();
    } else {
      this._matrix = this._matrix.inverse();
    }

    return this;
  }

  /**
   * Returns the `a` component of this TransformMatrix, where this TransformMatrix's components can be represented as follows:
   *
   * ```
   * [ a c e
   *   b d f
   *   0 0 1 ]
   * ```
   *
   * The `a` component affects horizontal scaling. A value of 1 results in no scaling.
   */
  get a() {
    return this._matrix.a;
  }
  set a(newValue) {
    this._matrix.a = newValue;
  }

  /**
   * Returns the `b` component of this TransformMatrix, where this TransformMatrix's components can be represented as follows:
   *
   * ```
   * [ a c e
   *   b d f
   *   0 0 1 ]
   * ```
   *
   * The `b` component affects vertical skewing.
   */
  get b() {
    return this._matrix.b;
  }
  set b(newValue) {
    this._matrix.b = newValue;
  }

  /**
   * Returns the `c` component of this TransformMatrix, where this TransformMatrix's components can be represented as follows:
   *
   * ```
   * [ a c e
   *   b d f
   *   0 0 1 ]
   * ```
   *
   * The `c` component affects horizontal skewing.
   */
  get c() {
    return this._matrix.c;
  }
  set c(newValue) {
    this._matrix.c = newValue;
  }

  /**
   * Returns the `d` component of this TransformMatrix, where this TransformMatrix's components can be represented as follows:
   *
   * ```
   * [ a c e
   *   b d f
   *   0 0 1 ]
   * ```
   *
   * The `d` component affects vertical scaling. A value of 1 results in no scaling.
   */
  get d() {
    return this._matrix.d;
  }
  set d(newValue) {
    this._matrix.d = newValue;
  }

  /**
   * Returns the `e` component of this TransformMatrix, where this TransformMatrix's components can be represented as follows:
   *
   * ```
   * [ a c e
   *   b d f
   *   0 0 1 ]
   * ```
   *
   * The `e` component affects horizontal translation (movement).
   */
  get e() {
    return this._matrix.e;
  }
  set e(newValue) {
    this._matrix.e = newValue;
  }

  /**
   * Returns the `f` component of this TransformMatrix, where this TransformMatrix's components can be represented as follows:
   *
   * ```
   * [ a c e
   *   b d f
   *   0 0 1 ]
   * ```
   *
   * The `f` component affects vertical translation (movement).
   */
  get f() {
    return this._matrix.f;
  }
  set f(newValue) {
    this._matrix.f = newValue;
  }
}
