// in theory, SVGMatrix will be used by the Canvas API in the future;
// in practice, we can borrow an SVG matrix today!
function createMatrix(): DOMMatrix {
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

// Based on code from https://stackoverflow.com/a/7397026/868460
// polyfills resetTransform and getTransform on the context
export default function polyfillContext(context: CanvasRenderingContext2D) {
  if (context.resetTransform && context.getTransform) return;

  let matrix = createMatrix();
  // the stack of saved matrices
  let savedMatrices = [matrix];

  const CanvasRenderingContext2DClass: typeof CanvasRenderingContext2D = context.constructor as any;
  class PolyfilledCanvasRenderingContext2D extends CanvasRenderingContext2DClass {
    save() {
      savedMatrices.push(matrix);
      super.save();
    }

    // if the stack of matrices we're managing doesn't have a saved matrix,
    // we won't even call the context's original `restore` method.
    restore() {
      if (savedMatrices.length == 0) return;
      super.restore();
      // @ts-ignore this is safe because we early return if the stack is zero
      matrix = savedMatrices.pop();
      super.setTransform(
        matrix.a,
        matrix.b,
        matrix.c,
        matrix.d,
        matrix.e,
        matrix.f
      );
    }

    scale(x: number, y: number) {
      matrix = matrix.scaleNonUniform(x, y);
      super.scale(x, y);
    }

    rotate(theta: number) {
      // canvas `rotate` uses radians, SVGMatrix uses degrees.
      matrix = matrix.rotate((theta * 180) / Math.PI);
      super.rotate(theta);
    }

    translate(x: number, y: number) {
      matrix = matrix.translate(x, y);
      super.translate(x, y);
    }

    setTransform(
      a: number,
      b: number,
      c: number,
      d: number,
      e: number,
      f: number
    ): void;
    setTransform(transform?: DOMMatrix2DInit): void;
    setTransform(...args: Array<any>): void {
      matrix = createMatrix();

      const [aOrTransform, b, c, d, e, f] = args;
      if (typeof aOrTransform === "object") {
        const transform: DOMMatrix2DInit = aOrTransform;
        Object.assign(matrix, transform);

        super.setTransform(transform);
      } else if (typeof aOrTransform === "number") {
        const a = aOrTransform;

        // 2x2 scale-skew matrix
        matrix.a = aOrTransform;
        matrix.b = b;
        matrix.c = c;
        matrix.d = d;

        // translation vector
        matrix.e = e;
        matrix.f = f;

        super.setTransform(a, b, c, d, e, f);
      } else {
        super.setTransform(...args);
      }

      savedMatrices = [matrix];
    }

    transform(
      a: number,
      b: number,
      c: number,
      d: number,
      e: number,
      f: number
    ) {
      const rhs = createMatrix();
      // 2x2 scale-skew matrix
      rhs.a = a;
      rhs.b = b;
      rhs.c = c;
      rhs.d = d;

      // translation vector
      rhs.e = e;
      rhs.f = f;
      matrix = matrix.multiply(rhs);
      super.transform(a, b, c, d, e, f);
    }

    resetTransform() {
      matrix = createMatrix();
      if (super.resetTransform) {
        super.resetTransform();
      } else {
        // Identity matrix
        super.setTransform(1, 0, 0, 1, 0, 0);
      }
    }

    getTransform() {
      return matrix;
    }
  }

  Object.setPrototypeOf(context, PolyfilledCanvasRenderingContext2D.prototype);

  return context;
}
