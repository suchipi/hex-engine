import Angle from "./Angle";
import Point from "./Point";

export function createSVGMatrix(): DOMMatrix {
  const matrix = document
    .createElementNS("http://www.w3.org/2000/svg", "g")
    .getCTM();
  if (matrix == null) {
    throw new Error(
      "Unable to create transformation matrix for CanvasRenderingContext2D getTransform polyfill. Maybe try using a newer browser?"
    );
  }
  return matrix;
}

export default class TransformMatrix {
  _matrix: DOMMatrix;

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

  scale(size: Point, origin: Point): TransformMatrix;
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

  scaleMutate(size: Point, origin: Point): this;
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

  translate(pos: Point): TransformMatrix;
  translate(x: number, y: number): TransformMatrix;
  translate(posOrX: Point | number, maybeY?: number): TransformMatrix {
    let x: number, y: number;
    if (typeof posOrX === "number") {
      x = posOrX;
      y = maybeY!;
    } else {
      x = (posOrX as Point).x;
      y = (posOrX as Point).y;
    }

    return TransformMatrix.fromDOMMatrix(this._matrix.translate(x, y));
  }

  translateMutate(pos: Point): this;
  translateMutate(x: number, y: number): this;
  translateMutate(posOrX: Point | number, maybeY?: number): this {
    let x: number, y: number;
    if (typeof posOrX === "number") {
      x = posOrX;
      y = maybeY!;
    } else {
      x = (posOrX as Point).x;
      y = (posOrX as Point).y;
    }

    if (typeof this._matrix.translateSelf === "function") {
      this._matrix.translateSelf(x, y);
    } else {
      this._matrix = this._matrix.translate(x, y);
    }

    return this;
  }

  rotate(radians: Angle | number): TransformMatrix {
    const rotation = typeof radians === "number" ? radians : radians.radians;
    // canvas `rotate` uses radians, DOMMatrix uses degrees.
    const degrees = (rotation * 180) / Math.PI;

    return TransformMatrix.fromDOMMatrix(this._matrix.rotate(degrees));
  }

  rotateMutate(radians: Angle | number): this {
    const rotation = typeof radians === "number" ? radians : radians.radians;
    // canvas `rotate` uses radians, DOMMatrix uses degrees.
    const degrees = (rotation * 180) / Math.PI;

    if (typeof this._matrix.rotateSelf === "function") {
      this._matrix.rotateSelf(degrees);
    } else {
      this._matrix = this._matrix.rotate(degrees);
    }

    return this;
  }

  times(other: TransformMatrix | DOMMatrix): TransformMatrix {
    const otherDomMatrix =
      other instanceof TransformMatrix ? other._matrix : other;

    return TransformMatrix.fromDOMMatrix(this._matrix.multiply(otherDomMatrix));
  }

  timesMutate(other: TransformMatrix | DOMMatrix): this {
    const otherDomMatrix =
      other instanceof TransformMatrix ? other._matrix : other;

    if (typeof this._matrix.multiplySelf === "function") {
      this._matrix.multiplySelf(otherDomMatrix);
    } else {
      this._matrix = this._matrix.multiply(otherDomMatrix);
    }

    return this;
  }

  transformPoint(point: Point): Point {
    const domPoint = point.asDOMPoint().matrixTransform(this._matrix);
    return new Point(domPoint.x, domPoint.y);
  }

  inverse(): TransformMatrix {
    return TransformMatrix.fromDOMMatrix(this._matrix.inverse());
  }

  inverseMutate(): this {
    if (typeof this._matrix.invertSelf === "function") {
      this._matrix.invertSelf();
    } else {
      this._matrix = this._matrix.inverse();
    }

    return this;
  }

  get a() {
    return this._matrix.a;
  }
  get b() {
    return this._matrix.b;
  }
  get c() {
    return this._matrix.c;
  }
  get d() {
    return this._matrix.d;
  }
  get e() {
    return this._matrix.e;
  }
  get f() {
    return this._matrix.f;
  }
}
