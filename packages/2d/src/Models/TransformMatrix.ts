import Angle from "./Angle";
import Vec2 from "./Vec2";

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

  scale(size: Vec2, origin: Vec2): TransformMatrix;
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

  translate(pos: Vec2): TransformMatrix;
  translate(x: number, y: number): TransformMatrix;
  translate(posOrX: Vec2 | number, maybeY?: number): TransformMatrix {
    let x: number, y: number;
    if (typeof posOrX === "number") {
      x = posOrX;
      y = maybeY!;
    } else {
      x = (posOrX as Vec2).x;
      y = (posOrX as Vec2).y;
    }

    return TransformMatrix.fromDOMMatrix(this._matrix.translate(x, y));
  }

  rotate(radians: Angle | number): TransformMatrix {
    const rotation = typeof radians === "number" ? radians : radians.radians;
    const degrees = (rotation * 180) / Math.PI;
    // canvas `rotate` uses radians, DOMMatrix uses degrees.
    return TransformMatrix.fromDOMMatrix(this._matrix.rotate(degrees));
  }

  multiply(other: TransformMatrix | DOMMatrix): TransformMatrix {
    return this.times(other);
  }

  times(other: TransformMatrix | DOMMatrix): TransformMatrix {
    const otherDomMatrix =
      other instanceof TransformMatrix ? other._matrix : other;

    return TransformMatrix.fromDOMMatrix(this._matrix.multiply(otherDomMatrix));
  }

  transformPoint(point: Vec2): Vec2 {
    const domPoint = point.asDOMPoint().matrixTransform(this._matrix);
    return new Vec2(domPoint.x, domPoint.y);
  }

  inverse(): TransformMatrix {
    return TransformMatrix.fromDOMMatrix(this._matrix.inverse());
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
