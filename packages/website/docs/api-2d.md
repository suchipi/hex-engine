---
title: "@hex-engine/2d"
---

`@hex-engine/2d` is the main package that you will interact with when using Hex Engine. It has several named exports, which are each documented here.

> NOTE: `@hex-engine/2d` also re-exports everything from [`@hex-engine/core`], but those exports are not documented here. Check the API documentation for [`@hex-engine/core`] if you can't find what you're looking for here.

## Models

`@hex-engine/2d` includes several "Models", which are classes representing common data structures that are used throughout the library.

### Angle

```ts
import { Angle } from "@hex-engine/2d";
```

An object which represents an Angle, in radians.

Angles are expressed as the _clockwise_ distance from the x-axis. This is different from how angles are expressed in normal coordinate space; the reason for this difference is because when drawing to a canvas, the positive y axis points _downwards_ instead of upwards.

![Diagram showing that radians increase as you move around the circle clockwise, starting from the x-axis](/img/canvas-angle-diagram.png)

#### Static Methods

#### constructor

`constructor(radians: number)`

Creates a new Angle.

##### fromPoints

`static fromPoints(first: Point, second: Point): Angle`

Calculates the angle of the vector whose tail is at the [`Point`] `first` and whose head
is at the [`Point`] `second`.

#### Properties

##### radians

`radians: number`

The angle, in radians.

#### Methods

##### clone

`clone(): Angle`

Creates a copy of this `Angle`.

##### toPoint

`toPoint(): Point`

Calculates the position of the head of a unit vector (a vector with magnitude `1`) with the given angle
whose tail is at the origin.

Returns a [`Point`].

##### add

`add(amount: number | Angle): Angle`

Returns a new Angle whose value is equivalent to the value of the
current Angle plus the specified amount.

This rotates the Angle clockwise.

##### addMutate

`addMutate(amount: number | Angle): this`

Mutates the current Angle, adding the specified amount to its current value.

This rotates the Angle clockwise.

##### subtract

`subtract(amount: number | Angle): Angle`

Returns a new Angle whose value is equivalent to the value of the
current Angle minus the specified amount.

This rotates the Angle counter-clockwise.

##### subtractMutate

`subtractMutate(amount: number | Angle): this`

Mutates the current Angle, subtracting the specified amount from its current value.

This rotates the Angle counter-clockwise.

### Circle

```ts
import { Circle } from "@hex-engine/2d";
```

Represents a circle; a shape with infinite points along its edge that are all
equidistant from its center.

The distance between the center and the edge points is known as the circle's
radius.

#### Static Methods

##### constructor

`constructor(radius: number)`

Creates a new Circle.

#### Properties

##### radius

`radius: number`

The radius of this circle; the length of a line segment that starts at the
circle's center and goes to its edge.

##### diameter

`diameter: number`

The diameter of this circle; the length of a line segment that starts at
the circle's edge, crosses through the circle's center, and continues to
the opposite edge.

##### width

`width: number`

The width of this circle; same as the diameter.

##### height

`height: number`

The height of this circle; same as the diameter.

#### Methods

##### boundingRectangle

`boundingRectangle(): Polygon`

Creates a rectangular polygon whose width and height are double this circle's radius;
said in other words, returns the rectangle that this circle could be perfectly
[inscribed](https://www.mathopenref.com/inscribed.html) in.

##### containsPoint

`containsPoint(point: Point): boolean`

Returns a value indicating if a given point is either within the circle or on the its edge.

##### equals

`equals(other: Circle): boolean`

Returns whether this circle has the same radius as another.

##### draw

`draw(context: CanvasRenderingContext2D, strokeOrFill: "stroke" | "fill", { x = 0, y = 0 }: { x?: number | undefined; y?: number | undefined } = {}): void`

Draws this circle onto a canvas context, using the current stroke or fill style.

### Grid

`class Grid<T>`

```ts
import { Grid } from "@hex-engine/2d";
```

Represents a two-dimensional Grid with arbitrary contents in each cell.

#### Static Methods

##### constructor

`constructor(rows: number, columns: number, defaultValue: T)` <br />
`constructor(rowsAndCols: Point, defaultValue: T)`

Creates a new Grid.

#### Properties

##### size

`size: Point`

The size of the grid, in rows and columns.

##### defaultValue

`defaultValue: T`

The default value to initialize empty cells with.

#### Methods

##### setData

`setData(data: Array<T>): void`

Fill in the grid with the provided data, represented as a 2D array.

##### get

`get(row: number, column: number): T` <br />
`get(pos: Point): T`

Get the value in the cell at the given row and column index.

##### set

`set(row: number, column: number, value: T): void` <br />
`set(pos: Point, value: T): void`

Set the value in the cell at the given row and column index.

##### contents

`*contents(): Generator<[number, number, T]>`

Returns an iterable of all the contents of this grid and their row and column indices.

### Point

```ts
import { Point } from "@hex-engine/2d";
```

A generic object with an `x` and `y` property.

Although it is named `Point`, it is not only used to represent points in space- it's also often used to represent two-dimensional sizes.

#### Static Methods

##### constructor

`constructor(x: number, y: number)`

Creates a new Point.

##### from

`static from({ x, y }: { x: number; y: number }): Point`

Create a Point from any object with an x property and a y property.

#### Properties

##### x

`x: number`

##### y

`y: number`

#### Methods

##### clone

`clone(): Point`

Create a new Point with the same x and y values as this one.

##### opposite

`opposite(): Point`

Create a new Point whose x and y values have the opposite sign as this one's.

##### oppositeMutate

`oppositeMutate(): this`

Mutate this Point so that its x and y values have the opposite sign.

##### add

`add(other: Point | number): Point`

Create a new Point whose x and y values are equivalent to this one's, but with the specified value added.

##### addMutate

`addMutate(other: Point | number): this`

Mutate this Point by adding the specified value to its x and y values.

##### addX

`addX(amount: number): Point`

Create a new Point whose x and y values are equivalent to this one's, but with the specified value added to the x value.

##### addXMutate

`addXMutate(amount: number): this`

Mutate this Point by adding the specified value to its x value.

##### addY

`addY(amount: number): Point`

Create a new Point whose x and y values are equivalent to this one's, but with the specified value added to the y value.

##### addYMutate

`addYMutate(amount: number): this`

Mutate this Point by adding the specified value to its y value.

##### subtract

`subtract(other: Point | number): Point`

Create a new Point whose x and y values are equivalent to this one's, but with the specified value subtracted.

##### subtractMutate

`subtractMutate(other: Point | number): this`

Mutate this Point by subtracting the specified value from its x and y values.

##### subtractX

`subtractX(amount: number): Point`

Create a new Point whose x and y values are equivalent to this one's, but with the specified value subtracted from the x value.

##### subtractXMutate

`subtractXMutate(amount: number): this`

Mutate this Point by subtracting the specified value from its x value.

##### subtractY

`subtractY(amount: number): Point`

Create a new Point whose x and y values are equivalent to this one's, but with the specified value subtracted from the y value.

##### subtractYMutate

`subtractYMutate(amount: number): this`

Mutate this Point by subtracting the specified value from its y value.

##### multiply

`multiply(other: Point | number): Point`

Create a new Point whose x and y values are equivalent to this one's, but with each multiplied by the specified value.

##### multiplyMutate

Mutate this Point by multiplying its x and y values with the specified value.

`multiplyMutate(other: Point | number): this`

##### multiplyX

`multiplyX(amount: number): Point`

Create a new Point whose x and y values are equivalent to this one's, but with the x value multiplied by the specified value.

##### multiplyXMutate

`multiplyXMutate(amount: number): this`

Mutate this Point by multiplying its x value by the specified value.

##### multiplyY

`multiplyY(amount: number): Point`

Create a new Point whose x and y values are equivalent to this one's, but with the y value multiplied by the specified value.

##### multiplyYMutate

`multiplyYMutate(amount: number): this`

Mutate this Point by multiplying its y value by the specified value.

##### divide

`divide(other: Point | number): Point`

Create a new Point whose x and y values are equivalent to this one's, but with each divided by the specified value.

##### divideMutate

`divideMutate(other: Point | number): this`

Mutate this Point by dividing its x and y values by the specified value.

##### divideX

`divideX(amount: number): Point`

Create a new Point whose x and y values are equivalent to this one's, but with its x value divided by the specified value.

##### divideXMutate

`divideXMutate(amount: number): this`

Mutate this Point by dividing its x value by the specified value.

##### divideY

`divideY(amount: number): Point`

Create a new Point whose x and y values are equivalent to this one's, but with its y value divided by the specified value.

##### divideYMutate

`divideYMutate(amount: number): this`

Mutate this Point by dividing its y value by the specified value.

##### equals

`equals(other: Point): boolean`

Check if this Point and another Point have the same x and y values.

##### distanceTo

`distanceTo(other: Point): number`

Measure the distance between this Point and another Point.

##### round

`round(): Point`

Return a new Point that is the same as this Point, but with its x and y values rounded to the nearest integer.

##### roundMutate

`roundMutate(): this`

Mutate this Point by rounding its x and y values to the nearest integer.

##### roundDown

`roundDown(): Point`

Return a new Point that is the same as this Point, but with its x and y values rounded down to the nearest integer.

##### roundDownMutate

`roundDownMutate(): this`

Mutate this Point by rounding its x and y values down to the nearest integer.

##### roundUp

`roundUp(): Point`

Return a new Point that is the same as this Point, but with its x and y values rounded up to the nearest integer.

##### roundUpMutate

`roundUpMutate(): this`

Mutate this Point by rounding its x and y values up to the nearest integer.

##### mutateInto

`mutateInto(other: { x: number; y: number })`

Mutate this Point by setting its x and y values to the values found on the provided object.

##### asDOMPoint

`asDOMPoint(): DOMPoint`

Create a DOMPoint with the same x and y values as this Point.

##### transformUsingMatrix

`transformUsingMatrix(matrix: DOMMatrix): Point`

Create a new Point by transforming this Point using the provided DOMMatrix.

##### transformUsingMatrixMutate

`transformUsingMatrixMutate(matrix: DOMMatrix): this`

Mutate this Point by transforming its x and y values using the provided DOMMatrix.

### Polygon

```ts
import { Polygon } from "@hex-engine/2d";
```

Represents a closed shape consisting of a set of connected straight line segments.

#### Static Methods

##### constructor

`constructor(points: Array<Point>)`

Creates a new Polygon.

The points are ordered such that one could draw the polygon by
placing a pen down at the first point, then dragging the pen in a straight line
to the second point, then the third, and so on until the last point,
which is connected to the first point.

Note that the x and y values on the points on the created Polygon
may not be the same as the x and y values on the points you give here,
because the constructor calculates the centroid of the polygon and then
recenters all points around it.

##### rectangle

`static rectangle(size: Point): Polygon` <br />
`static rectangle(width: number, height: number): Polygon`

Creates a rectangular polygon; a 4-sided polygon where the angles between all sides are all π/2 radians (90 degrees).

#### Properties

##### points

`points: Array<Point>`

Points representing the corners where the polygon's line segments meet.
Their `x` and `y` properties refer to their position relative to the
polygon's [centroid](https://en.wikipedia.org/wiki/Centroid).

The points are ordered such that one could draw the polygon by
placing a pen down at the first point, then dragging the pen in a straight line
to the second point, then the third, and so on until the last point,
which is connected to the first point.

##### width

`width: number`

The horizontal distance between the leftmost point in the polygon and the rightmost point on the polygon.

##### height

`height: number`

The vertical distance between the highest point in the polygon and the lowest point on the polygon.

#### Methods

##### boundingRectangle

`boundingRectangle(): Polygon`

Creates a rectangular polygon whose width and height match that of this polygon;
said in other words, returns the rectangle that this polygon could be perfectly
[inscribed](https://www.mathopenref.com/inscribed.html) in.

##### containsPoint

`containsPoint(point: Point): boolean`

Returns whether the given point falls inside the polygon.

##### equals

`equals(other: Polygon): boolean`

Returns whether this polygon has the same point values as another.

##### draw

`draw(context: CanvasRenderingContext2D, strokeOrFill: "stroke" | "fill", { x = 0, y = 0 }: { x?: number | undefined; y?: number | undefined } = {}): void`

Draws this polygon onto a canvas context, using the current stroke or fill style.

### TransformMatrix

```ts
import { TransformMatrix } from "@hex-engine/2d";
```

#### Static Methods

##### constructor

`constructor()` <br />
`constructor(a: number, b: number, c: number, d: number, e: number, f: number)`

Creats a new TransformMatrix. If no a-f values are provided, they will default to the identity matrix.

##### fromDOMMatrix

`static fromDOMMatrix(domMatrix: DOMMatrix): TransformMatrix`

Create a TransformMatrix from a DOMMatrix of SVGMatrix.

#### Properties

##### a

`readonly a: number`

Returns the `a` component of this TransformMatrix, where this TransformMatrix's components can be represented as follows:

```
[ a c e
  b d f
  0 0 1 ]
```

The `a` component affects horizontal scaling. A value of 1 results in no scaling.

##### b

`readonly b: number`

Returns the `b` component of this TransformMatrix, where this TransformMatrix's components can be represented as follows:

```
[ a c e
  b d f
  0 0 1 ]
```

The `b` component affects vertical skewing.

##### c

`readonly c: number`

Returns the `c` component of this TransformMatrix, where this TransformMatrix's components can be represented as follows:

```
[ a c e
  b d f
  0 0 1 ]
```

The `c` component affects horizontal skewing.

##### d

`readonly d: number`

Returns the `d` component of this TransformMatrix, where this TransformMatrix's components can be represented as follows:

```
[ a c e
  b d f
  0 0 1 ]
```

The `d` component affects vertical scaling. A value of 1 results in no scaling.

##### e

`readonly e: number`

Returns the `e` component of this TransformMatrix, where this TransformMatrix's components can be represented as follows:

```
[ a c e
  b d f
  0 0 1 ]
```

The `e` component affects horizontal translation (movement).

##### f

`readonly f: number`

Returns the `f` component of this TransformMatrix, where this TransformMatrix's components can be represented as follows:

```
[ a c e
  b d f
  0 0 1 ]
```

The `f` component affects vertical translation (movement).

#### Methods

##### scale

`scale(size: Point, origin: Point): TransformMatrix` <br />
`scale(sizeX: number, sizeY: number, originX: number, originY: number): TransformMatrix`

Creates a new TransformMatrix with the same values as this one, but with a scale operation applied.

##### scaleMutate

`scaleMutate(size: Point, origin: Point): this` <br />
`scaleMutate(sizeX: number, sizeY: number, originX: number, originY: number): this`

Mutates this TransformMatrix by applying a scale operation.

##### translate

`translate(pos: Point): TransformMatrix` <br />
`translate(x: number, y: number): TransformMatrix`

Creates a new TransformMatrix with the same values as this one, but with a translation applied.

##### translateMutate

`translateMutate(pos: Point): this` <br />
`translateMutate(x: number, y: number): this`

Mutates this TransformMatrix by applying a translation.

##### rotate

`rotate(radians: Angle | number): TransformMatrix`

Creates a new TransformMatrix with the same values as this one, but with a rotation applied.

##### rotateMutate

`rotateMutate(radians: Angle | number): this`

Mutates this TransformMatrix by applying a rotation.

##### multiply

`multiply(other: TransformMatrix | DOMMatrix): TransformMatrix`

Creates a new TransformMatrix by multiplying this one with another.

##### multiplyMutate

`multiplyMutate(other: TransformMatrix | DOMMatrix): this`

Mutates this TransformMatrix by multiplying it with another.

##### transformPoint

`transformPoint(point: Point): Point`

Applies this TransformMatrix's transform to the provided Point values, and returns a new Point.

This does _not_ mutate the provided Point.

##### transformPointMutate

`transformPointMutate(point: Point): Point`

Applies this TransformMatrix's transform to the provided Point values, and mutates the provided Point to contain the transformed values.

##### inverse

`inverse(): TransformMatrix`

Return a new TransformMatrix that applies the inverse transformation as this one.

##### inverseMutate

`inverseMutate(): this`

Mutate this TransformMatrix by inverting its transformation.

### Vector

```ts
import { Vector } from "@hex-engine/2d";
```

A representation of a 2D Vector, with an angle and magnitude.

#### Static Methods

##### constructor

`constructor(angle: Angle, magnitude: number)`

Creates a new Vector.

##### fromPoints

`static fromPoints(first: Point, second: Point): Vector`

Creates a vector with tail at `first` and head at `second`.

#### Properties

##### angle

`angle: Angle`

The angle that the Vector is pointing in, clockwise relative to the X-axis.

##### magnitude

`magnitude: number`

The length of the Vector.

#### Methods

##### clone

`clone(): Vector`

Creates a new Vector instance with the same values as this one.

##### toPoint

`toPoint(): Point`

Places this vector's tail at the origin and returns the location of its head.

##### multiply

`multiply(amount: number): Vector`

Returns a new Vector whose angle is the same as this Vector and whose magnitude is multiplied by the specified amount.

##### multiplyMutate

`multiplyMutate(amount: number): this`

Mutates the current vector by multiplying its magnitude by the specified amount.

##### divide

`divide(amount: number): Vector`

Returns a new Vector whose angle is the same as this Vector and whose magnitude is divided by the specified amount.

##### divideMutate

`divideMutate(amount: number): this`

Mutates the current vector by dividing its magnitude by the specified amount.

### AnimationFrame

`class AnimationFrame<T>`

```ts
import { AnimationFrame } from "@hex-engine/2d";
```

A class that represents a single frame in an animation.

The data that is in this frame can be anything.

#### Static Methods

##### constructor

`constructor(data: T, { duration, onFrame }: { duration: number; onFrame?: null | (() => void) })`

Creates a new AnimationFrame.

#### Properites

##### data

`data: T`

The data contained in this frame.

##### duration

`duration: number // in ms`

The duration of this frame, in milliseconds.

##### onFrame

`onFrame: (() => void) | null`

A function to call when this frame is reached; can be used, for example, to play sound effects.

### HexMouseEvent

```ts
import { HexMouseEvent } from "@hex-engine/2d";
```

A Mouse event in Hex Engine.

You will almost never construct this class manually; instead, an instance of it will be passed to listener functions you set up using the `Mouse` or `LowLevelMouse` components.

#### Properties

##### pos

`pos: Point`

The position of the cursor, relative to the current Entity's origin.

##### delta

`delta: Point`

The amount that the cursor has moved since the last frame.

##### buttons

`buttons: { left: boolean, right: boolean, middle: boolean, mouse4: boolean, mouse5: boolean }`

Which buttons were pressed during this event, or, in the case of a MouseUp event, which buttons were released.

## Components

`@hex-engine/2d` includes several [Component](/docs/api-core#component) functions that you can use in your [Entities](/docs/api-core#entity).

### Canvas

```ts
import { Canvas } from "@hex-engine/2d";
```

The built-in Canvas component that should be placed on your root Entity in order to render everything in your game.

```ts
function Canvas(options: {
  /**
   * You can specify an existing Canvas element to render into, if desired.
   * If you do not, one will be created.
   */
  element?: HTMLCanvasElement;

  /** The background color to set the canvas to prior to drawing each frame. */
  backgroundColor: string;
}): {
  element: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  backstage: CanvasRenderingContext2D;
  setPixelated: (on: boolean) => void;

  resize(opts: {
    realWidth: number;
    realHeight: number;
    pixelWidth: number;
    pixelHeight: number;
  }): void;

  fullscreen({ pixelZoom?: number } = {}): void;
};
```

### Canvas.DrawOrder

```ts
import { Canvas } from "@hex-engine/2d";

Canvas.DrawOrder;
```

This Component can be placed on the root Entity to specify the draw order that the
`Canvas` Component will use. If no `Canvas.DrawOrder` Component is present on the
root Entity, then `Canvas.DrawOrder.defaultSort` will be used as the sort order.

```ts
function DrawOrder(
  sort: (entities: Array<Entity>) => Array<Component>
): {
  sort: (entities: Array<Entity>) => Array<Component>;
};
```

### Animation

```ts
import { Animation, AnimationAPI } from "@hex-engine/2d";
```

A Component that represents an Animation, where each frame has a duration and contains arbitrary data.

```ts
function Animation<T>(frames: Array<AnimationFrame<T>>): AnimationAPI<T>;
```

This Component function returns a type called `AnimationAPI` which is defined as follows:

```ts
type AnimationAPI<T> = {
  /** The current animation frame; ie, current in time. */
  currentFrame: AnimationFrame<T>;

  /** Pause playback of this animation. */
  pause(): void;

  /** Begin or resume playback of this animation. */
  play(): void;

  /** Restart playback of this animation from the first frame. */
  restart(): void;
};
```

### AnimationSheet

```ts
import { AnimationSheet } from "@hex-engine/2d";
```

A Component representing an AnimationSheet image; that is, a filmstrip-style image
of sprites which should be rendered in a particular sequence as part of an animation.

```ts
function AnimationSheet(options: {
  url: string;
  tileWidth: number;
  tileHeight: number;
  animations: {
    [name: string]: AnimationAPI<number>;
  };
}): {
  /** The current animation, that frames will be drawn from. */
  currentAnim: AnimationAPI<number>;

  draw(
    context: CanvasRenderingContext2D,
    options: {
      x?: number | undefined;
      y?: number | undefined;
      width?: number | undefined;
      height?: number | undefined;
    } = {}
  ): void;
};
```

### Aseprite

```ts
import { Aseprite } from "@hex-engine/2d";
import blueSlime from "./blueSlime.aseprite";

Aseprite(blueSlime);
```

A Component which loads and draws Aseprites sprites and animations.

```ts
function Aseprite(
  data: AsepriteLoader.Data
): {
  /** The current animation, that frames will be drawn from. */
  currentAnim: AnimationAPI<HTMLCanvasElement>;

  /** The aseprite-loader data that was passed into this function. */
  data: AsepriteLoader.Data;

  /**
   * All the animations that were found in the Aseprite file.
   *
   * We use Tags to find these, and also include an animation called "default" which
   * is the animation containing every frame in the file, in order.
   */
  animations: {
    [name: string]: AnimationAPI<HTMLCanvasElement>;
  };

  /** Draw the current animation frame into the provided canvas context. */
  draw: (
    context: CanvasRenderingContext2D,
    options?: {
      x?: number | undefined;
      y?: number | undefined;
    }
  ) => void;

  /** The maximum size of the frames in this Aseprite file. */
  size: Point;
};
```

### Audio

```ts
import { Audio } from "@hex-engine/2d";
```

A function that loads and plays a sound clip from a URL.

You can get a URL for a sound clip by `import`ing it, as if it was code:

```ts
import mySound from "./my-sound.ogg";

console.log(typeof mySound); // "string"

useNewComponent(() => Audio({ url: mySound }));
```

When you import an audio clip in this way, it will be automatically
added to the build and included in the final build output.

```ts
function Audio({
  url,
}: Props): {
  /** Play this audio clip, if it's loaded. If it isn't loaded yet, nothing will happen. */
  play(options?: {
    /** Specify the playback volume, from 0 to 1. */
    volume?: number;
  }): Promise<void>;
};
```

### AudioContext

```ts
import { AudioContext } from "@hex-engine/2d";
```

A Component to be placed on the root Entity, which creates a Web Audio API
`AudioContext` upon first user interaction with the page.

Web browsers disallow playback of audio prior to user interaction, which is
why this Component waits until the first click or keypress to come from the user
before creating an AudioContext.

```ts
function AudioContextComponent(): {
  audioContext: AudioContext | null;
};
```

### BMFont

```ts
import { BMFont } from "@hex-engine/2d";
import silver from "./silver.fnt";

BMFont(silver);
```

This Component uses an AngelCode BMFont-format file to render text into the canvas.

```ts
function BMFont(
  data: BMFontLoader.Font
): {
  /** The BMFont file data passed into this Component. */
  data: BMFontLoader.Font;

  /** All the Image Components that this Component created in order to load the font. */
  images: Array<Image>;

  /** Whether all the images the font references have been loaded yet. */
  readyToDraw(): void;

  /** Measures how many pixels wide the specified text would be, if it was rendered using this font. */
  measureWidth(text: string): number;

  /** Returns this font's size. */
  getFontSize(): number;

  /** Draws some text into the canvas, using this font. */
  drawText(
    context: CanvasRenderingContext2D,
    text: string,
    options?: {
      x?: number | undefined;
      y?: number | undefined;
    }
  ): void;

  /** Measure the sizes of various aspects of this font. */
  measureText: (
    text: string
  ) => {
    baseline: number;
    median: number;
    descender: number;
    ascender: number;
    capHeight: number;
    ascent: number;
    height: number;
    width: number;
  };
};
```

### Font

```ts
import { Font } from "@hex-engine/2d";
```

This Component defines a baseline interface for Font Components,
so that other Components can consume fonts without concern for their
implementation details.

It is rarely used directly; instead, use `BMFont` or `SystemFont`.

### FontMetrics

```ts
import { FontMetrics } from "@hex-engine/2d";
```

This Component measures various characters using the specified font in order to
provide a function which can accurately predict the render size of text on the page.

It is rarely used directly; instead, use `BMFont` or `SystemFont`.

### Gamepad

```ts
import { Gamepad } from "@hex-engine/2d";
```

This Component provides the current state of a connected Gamepad, if present.

```ts
function Gamepad(
  options: Partial<{
    /**
     * A minimum amount that analog sticks on the gamepad must be pushed from
     * the center position before they register as having moved from the center position.
     *
     * This value can be from 0 to 1, but should usually be a small value, like 0.1.
     */
    deadzone: number;

    /**
     * An array of button names for the gamepad, cooresponding to the button indices in the
     * `gamepad.buttons` array, where `gamepad` is a gamepad returned from `navigator.getGamepads()`.
     *
     * If you do not provide a list of button names, then names for the buttons on a PlayStation controller
     * will be used, even if the connected controller is not a PlayStation controller.
     */
    buttonNames: Array<string>;

    /**
     * Which gamepad connected to the computer this Gamepad component represents, starting from 0.
     */
    gamepadIndex: number;
  }>
): {
  /** A `Vector` indicating which direction the left stick is being pressed in, and how far it's being pressed. */
  leftStick: Vector;

  /** A `Vector` indicating which direction the right stick is being pressed in, and how far it's being pressed. */
  rightStick: Vector;

  /** A Set containing all the names of the currently pressed buttons. */
  pressed: Set<string>;

  /**
   * A boolean indicating whether a gamepad is connected.
   *
   * Note that the way the Web Gamepad API works, controllers do not show as connected
   * until the user first presses a button.
   */
  present: false;

  /**
   * The configured deadzone for the gamepad; that is, a number
   * used as a minimum value that the analog sticks must be moved
   * from their center position before their effective position is
   * considered different from the center position.
   */
  deadzone: number;

  /**
   * The configured button names for the gamepad. These names coorespond to button indices
   * in the Web Gamepad API, and will be used in the `pressed` Set.
   */
  buttonNames: Array<string>;
};
```

### Geometry

```ts
import { Geometry } from "@hex-engine/2d";
```

This Component provides information about the shape, position, rotation, and scale
of the current Entity. It is used by `useDraw` and `Physics.Body`, among other things.

You should only have one `Geometry` component per `Entity`.

```ts
function Geometry<S extends Polygon | Circle>(init: {
  shape: S;
  position?: Point | undefined;
  rotation?: Angle | undefined;
  scale?: Point | undefined;
}): {
  shape: S;
  position: Point;
  rotation: Angle;
  scale: Point;
  worldPosition(): Point;
};
```

### Image

```ts
import { Image } from "@hex-engine/2d";
```

A function that loads and draws an image from a URL.

You can get a URL for an image on disk by `import`ing it, as if it was code:

```ts
import myImage from "./my-image.png";

console.log(typeof myImage); // "string"

useNewComponent(() => Image({ url: myImage }));
```

When you import an image in this way, it will be automatically
added to the build and included in the final build output.

```ts
function Image(options: {
  url: string;
}): {
  /** Draw the Image into the provided canvas context, if it has been loaded. */
  draw(
    context: CanvasRenderingContext2D,
    options: {
      x: number;
      y: number;
      sourceX?: undefined | number;
      sourceY?: undefined | number;
      sourceWidth?: undefined | number;
      sourceHeight?: undefined | number;
      targetWidth?: undefined | number;
      targetHeight?: undefined | number;
    }
  ): void;
};
```

### ImageFilter

```ts
import { ImageFilter } from "@hex-engine/2d";
```

This Component uses the canvas `getImageData` and `putImageData` APIs
to filter the contents of a Canvas by passing it through a filter function.

Note: `getImageData` and `putImageData` are very slow, so if you can,
try not to call this every frame.

```ts
function ImageFilter(
  filter: (data: ImageData) => void
): {
  /**
   * Reads the pixels in `input` into an ImageData object, passes that `ImageData`
   * object into the filter this ImageFilter Component was constructed with,
   * and then writes the pixels in the ImageData object into `output`.
   */
  apply(
    input: CanvasRenderingContext2D,
    output: CanvasRenderingContext2D
  ): void;
};
```

### Keyboard

```ts
import { Keyboard } from "@hex-engine/2d";
```

This Component provides information about which keys on the user's keyboard are currently pressed.

```ts
function Keyboard(
  options: {
    /**
     * If this is set to true, then `event.preventDefault()`
     * will be called on every keyboard event that goes through this Component.
     */
    preventDefault?: undefined | boolean;
  } = {}
): {
  /**
   * A Set containing the names of all the keys
   * that are currently pressed.
   *
   * For a list of which Strings will be used, check [This page on MDN](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values),
   * or press some keys and look at the values present
   * in this Set using Hex Engine's inspector.
   */
  pressed: Set<string>;

  /**
   * A helper function that creates a `Vector` pointing in the direction indicated by
   * the combined state of the four specified direction keys. This is mainly useful
   * in that it allows you to treat Gamepad and Keyboard inputs the same.
   *
   * @param upKey The key that represents "up", eg "w".
   * @param downKey The key that represents "down", eg "s".
   * @param leftKey The key that represents "left", eg "a".
   * @param rightKey The key that represents "right", eg "d".
   */
  vectorFromKeys(
    upKey: string,
    downKey: string,
    leftKey: string,
    rightKey: string
  ): Vector;
};
```

### Label

```ts
import { Label } from "@hex-engine/2d";
```

This Component renders some text using the provided Font Component (either a Font, BMFont, or SystemFont).

```ts
function Label(options: {
  /** The text to render. */
  text?: string;
  /** The font to use. */
  font: FontImplementation;
}): {
  /** The amount of space that the text will take up, when drawn. */
  size: Point;

  /** Draws the text into the context. */
  draw(
    context: CanvasRenderingContext2D,
    options?: {
      x?: number | undefined;
      y?: number | undefined;
    }
  ): void;

  /** The text to render. You can change this to change what to render. */
  text: string;
};
```

### LowLevelMouse

```ts
import { LowLevelMouse } from "@hex-engine/2d";
```

A low-level Mouse Component. It supports mousemove, mousedown, and mouseup events.
For click events, information about whether the cursor is within an Entity's geometry,
and clean separation between left-click, right-click, and middle-click events, use `Mouse` instead.

```ts
function LowLevelMouse(): {
  /** Registers the provided function to be called when the mouse cursor moves. */
  onMouseMove: (callback: (event: HexMouseEvent) => void) => void;

  /** Registers the provided function to be called when any button on the mouse is pressed down. */
  onMouseDown: (callback: (event: HexMouseEvent) => void) => void;

  /** Registers the provided function to be called when any button on the mouse is released. */
  onMouseUp: (callback: (event: HexMouseEvent) => void) => void;
};
```

### Mouse

```ts
import { Mouse } from "@hex-engine/2d";
```

A Component that gives you information about where the Mouse is, relative to the current Entity,
and lets you register functions to be called when the mouse cursor interacts with the current Entity.

```ts
function Mouse(options?: {
  /**
   * The entity that this Mouse Component should give information about and relative to.
   * If not provided, it will use the current Entity.
   */
  entity?: Entity | undefined;
  /**
   * The Geometry Component that this Mouse should use to identify whether the cursor
   * is inside the Entity or not. If not provided, it will attempt to get a Geometry
   * component off of the Entity.
   */
  geometry?: ReturnType<typeof Geometry> | null;
}): {
  /**
   * A boolean indicating whether the mouse cursor is currently within the Entity, according
   * to the Shape on the Geometry this Component has been configured to use.
   */
  isInsideBounds: boolean;

  /**
   * A boolean indicating whether the left mouse button is currently being pressed.
   */
  isPressingLeft: boolean;

  /**
   * A boolean indicating whether the right mouse button is currently being pressed.
   */
  isPressingRight: boolean;

  /**
   * A boolean indicating whether the middle mouse button is currently being pressed.
   */
  isPressingMiddle: boolean;

  /**
   * The current position of the mouse cursor, relative to the Entity this Component has been
   * configured to use.
   */
  position: Point;

  /**
   * Registers a function to be called when the mouse cursor enters the configured Entity's bounds.
   *
   * The function will be called with a `HexMouseEvent`.
   */
  onEnter: (callback: (event: HexMouseEvent) => void) => void;

  /**
   * Registers a function to be called whenever the mouse cursor moves,
   * *even if it is not within the Entity's bounds*.
   *
   * The function will be called with a `HexMouseEvent`.
   */
  onMove: (callback: (event: HexMouseEvent) => void) => void;

  /**
   * Registers a function to be called whenever the mouse cursor exits the configured Entity's bounds.
   *
   * The function will be called with a `HexMouseEvent`.
   */
  onLeave: (callback: (event: HexMouseEvent) => void) => void;

  /**
   * Registers a function to be called whenever the _LEFT_ mouse button is pressed down
   * within the configured Entity's bounds.
   *
   * If you need an onDown event for a mouse button other than the left button, you will
   * have to use the `LowLevelMouse` Component instead.
   *
   * The function will be called with a `HexMouseEvent`.
   */
  onDown: (callback: (event: HexMouseEvent) => void) => void;

  /**
   * Registers a function to be called whenever the _LEFT_ mouse button is released
   * within the configured Entity's bounds.
   *
   * If you need an onDown onUp for a mouse button other than the left button, you will
   * have to use the `LowLevelMouse` Component instead.
   *
   * The function will be called with a `HexMouseEvent`.
   */
  onUp: (callback: (event: HexMouseEvent) => void) => void;

  /**
   * Registers a function to be called whenever the left mouse button is pressed
   * and then released within the configured Entity's bounds.
   *
   * The function will be called with a `HexMouseEvent`.
   */
  onClick: (callback: (event: HexMouseEvent) => void) => void;

  /**
   * Registers a function to be called whenever the right mouse button is pressed
   * and then released within the configured Entity's bounds.
   *
   * The function will be called with a `HexMouseEvent`.
   */
  onRightClick: (callback: (event: HexMouseEvent) => void) => void;

  /**
   * Registers a function to be called whenever the middle mouse button is pressed
   * and then released within the configured Entity's bounds.
   *
   * The function will be called with a `HexMouseEvent`.
   */
  onMiddleClick: (callback: (event: HexMouseEvent) => void) => void;
};
```

### Physics.Engine

```ts
import { Physics } from "@hex-engine/2d";
Physics.Engine;
```

A Component that should be placed on the root Entity if you want to use physics in your game.

Hex Engine's Physics are provided by [Matter.js](https://brm.io/matter-js/).

```ts
function PhysicsEngine(options?: {
  /**
   * Whether to render red wireframes of all physics bodies and constraints
   * into the canvas, for debugging purposes.
   */
  debugDraw?: boolean;

  /**
   * The gravity of the world, as a Point with x and y Components.
   * An x or y value of 1 means "normal Earth gravity in this direction".
   */
  gravity?: Point;

  /**
   * Whether to enable sleeping in the physics simulation.
   * This puts bodies that have not moved in a while to "sleep", and does
   * not update them until another body collides with them. This helps with framerate,
   * but at the expense of simulation accuracy.
   */
  enableSleeping?: boolean;
}): {
  /** The Matter.js Engine object. */
  engine: Matter.Engine;

  /**
   * Adds a collision listener for the current Entity.
   *
   * It will be called when another Entity's Physics.Body collides with this Entity's.
   */
  addCollisionListener: (
    callback: (other: { body: Matter.Body; entity: null | Entity }) => void
  ) => void;

  /**
   * Whether to render red wireframes of all physics bodies and constraints
   * into the canvas, for debugging purposes.
   */
  debugDraw: boolean;
};
```

### Physics.Body

```ts
import { Physics } from "@hex-engine/2d";
Physics.Body;
```

A Component that should be added to any Entity that will participate in the physics simulation.

Hex Engine's Physics are provided by [Matter.js](https://brm.io/matter-js/).

```ts
function PhysicsBody(
  geometry: ReturnType<typeof Geometry>,
  options?: Partial<{
    /**
     * A label for this body, for debugging purposes. If unspecified, defaults to the current Entity's name.
     */
    label: string;

    /**
     * Whether the body should *not* move around. If this is set, things will still collide with it, but it'll be "frozen" in the sky.
     */
    isStatic: boolean;

    /**
     * The density of this body.
     *
     * For more information, check the [Matter.js documentation](https://brm.io/matter-js/docs/classes/Body.html).
     */
    density: number;

    /**
     * The friction of this body.
     *
     * For more information, check the [Matter.js documentation](https://brm.io/matter-js/docs/classes/Body.html).
     */
    friction: number;

    /**
     * The friction this body feel in the air, due to air resistance.
     *
     * For more information, check the [Matter.js documentation](https://brm.io/matter-js/docs/classes/Body.html).
     */
    frictionAir: number;

    /**
     * Whether this body is a "Sensor"; if it is, then it will emit collision
     * events, but it will be frozen in space and objects will go right through it.
     *
     * In some engines, these are called "Brushes" or "Volumes".
     *
     * For more information, check the [Matter.js documentation](https://brm.io/matter-js/docs/classes/Body.html).
     */
    isSensor: boolean;

    /**
     * How bouncy this body is.
     *
     * For more information, check the [Matter.js documentation](https://brm.io/matter-js/docs/classes/Body.html).
     */
    restitution: number;

    /**
     * The time scale that this body runs through the simulation at.
     *
     * For more information, check the [Matter.js documentation](https://brm.io/matter-js/docs/classes/Body.html).
     */
    timeScale: number;

    /**
     * The static friction of the body (in the Coulomb friction model).
     *
     * For more information, check the [Matter.js documentation](https://brm.io/matter-js/docs/classes/Body.html).
     */
    frictionStatic: number;

    /**
     * Properties that define whether this body collides with other bodies.
     *
     * For more information, check the [Matter.js documentation](https://brm.io/matter-js/docs/classes/Body.html).
     */
    collisionFilter: {
      group: number;
      category: number;
      mask: number;
    };
  }>
): {
  body: Matter.Body;
  applyForce(position: Point, force: Vector): void;
  setAngle(angle: Angle | number): void;
  setAngularVelocity(velocity: number): void;
  setDensity(density: number): void;
  setInertia(inertia: number): void;
  setMass(mass: number): void;
  setPosition(position: Point): void;
  setStatic(isStatic: boolean): void;
  setVelocity(velocity: Point): void;
  onCollision: (
    callback: (other: { body: Matter.Body; entity: null | Entity }) => void
  ) => void;
};
```

### Physics.Constraint

```ts
import { Physics } from "@hex-engine/2d";
Physics.Constraint;
```

A Component that can be used to bind two physics bodies together with a rope,
spring, nail, or other real or imaginary constraint.

Hex Engine's Physics are provided by [Matter.js](https://brm.io/matter-js/).

```ts
function PhysicsConstraint(
  options: Partial<{
    /**
     * A value from 0 to 1 that determines how quickly the constraint returns
     * to its resting length. 1 means very stiff, and 0.2 means a soft spring.
     *
     * For more information, check the [Matter.js Documentation](https://brm.io/matter-js/docs/classes/Constraint.html)
     */
    stiffness: number;

    /**
     * A value from 0 to 1 that determines the damping, which limits oscillation.
     *
     * 0 means no damping, and 0.1 means no damping.
     *
     * For more information, check the [Matter.js Documentation](https://brm.io/matter-js/docs/classes/Constraint.html)
     */
    damping: number;

    /**
     * The first body that this constraint is attached to.
     *
     * For more information, check the [Matter.js Documentation](https://brm.io/matter-js/docs/classes/Constraint.html)
     */
    bodyA: Matter.Body;

    /**
     * The second body that this constraint is attached to.
     *
     * For more information, check the [Matter.js Documentation](https://brm.io/matter-js/docs/classes/Constraint.html)
     */
    bodyB: Matter.Body;

    /**
     * The position where the constraint is attached to `bodyA`, or a world-space position
     * that the constraint is attached to if `bodyA` is not defined..
     *
     * For more information, check the [Matter.js Documentation](https://brm.io/matter-js/docs/classes/Constraint.html)
     */
    pointA: Point;

    /**
     * The position where the constraint is attached to `bodyB`, or a world-space position
     * that the constraint is attached to if `bodyB` is not defined..
     *
     * For more information, check the [Matter.js Documentation](https://brm.io/matter-js/docs/classes/Constraint.html)
     */
    pointB: Point;

    /**
     * The resting length of the constraint.
     *
     * For more information, check the [Matter.js Documentation](https://brm.io/matter-js/docs/classes/Constraint.html)
     */
    length: number;

    /**
     * A label, for debugging purposes.
     *
     * For more information, check the [Matter.js Documentation](https://brm.io/matter-js/docs/classes/Constraint.html)
     */
    label: string;
  }>
): {
  constraint: Matter.Constraint;
};
```

### ProcceduralSfx

```ts
import { ProcceduralSfx } from "@hex-engine/2d";
```

A Component that can be used to generate procedural sound effects,
by synthesizing modal sounds. A modal sound is a resonating, ringing
sound that is composed out of several different sine waves, such as
the sound that is emitted when you strike a wine glass or metal rod.

If you use a spectrogram to identify the frequency, amplitude, and decay rate
of the sine waves that the sound is made out of, then you can provide them
to this function, and it will create a model that synthesizes that sound.

If you then vary the frequency, amplitude, or decay rate slightly each time
the sound is played, you can get a rich bank of sound effects all from one sound.

```ts
function ProceduralSfx(
  modes: Array<{
    frequency: number;
    amplitude: number;
    decay: number;
  }>
): {
  /**
   * Returns the synthesis model, if it is available.
   *
   * To work around browsers disallowing sound to be played without the user interacting with
   * the page first, the synthesis model will not be created until the first time the user
   * clicks on the page, or presses a key. Until then, this will be `null`.
   */
  synthesis: Object; // return type of makeModalSynthesis from the "modal-synthesis" package

  play(options?: {
    amplitudeMultiplier?: number | ((modeIndex: number) => number) | undefined;
    frequencyMultiplier?: number | ((modeIndex: number) => number) | undefined;
    decayMultiplier?: number | ((modeIndex: number) => number) | undefined;
    whiteNoiseDuration?: number | undefined;
  }): void;
};
```

### SpriteSheet

```ts
import { SpriteSheet } from "@hex-engine/2d";
```

A Component that helps you draw individual sprites from a sprite sheet.

It is designed to be used with an image that is laid out like a film strip,
with many sprites on it. Each sprite will be assigned an index from left-to-right,
top-to-bottom (if there are multiple rows in the sheet), and you can specify which
index should be drawn to the canvas.

````ts
function SpriteSheet(options: {
  /**
   * The image URL.
   *
   * You can get a URL for an image on disk by `import`ing it, as if it was code:
   *
   * ```ts
   * import myImage from "./my-image.png";
   *
   * console.log(typeof myImage); // "string"
   * ```
   *
   * When you import an image in this way, it will be automatically
   * added to the build and included in the final build output.
   */
  url: string;

  /**
   * The width of each "tile" in the sheet, in pixels.
   */
  tileWidth: number;

  /**
   * The height of each "tile" in the sheet, in pixels.
   */
  tileHeight: number;
}): {
  /** The size of each tile in the sheet. */
  tileSize: Point;

  /** Draw the tile at the specified index into the canvas. */
  draw(
    context: CanvasRenderingContext2D,
    options: {
      x?: number | void;
      y?: number | void;
      tileIndex: number;
      width?: void | number;
      height?: void | number;
    }
  ): void;
};
````

### SystemFont

```ts
import { SystemFont } from "@hex-engine/2d";
```

This Component uses an installed font on the system to render text into the canvas.

```ts
function SystemFont(options: {
  name: string;
  size: number;
  color?: void | string;
}): {
  name: string;
  size: number;
  color: string;

  readyToDraw(): boolean;
  drawText(
    context: CanvasRenderingContext2D,
    text: string,
    options?: { x?: number | undefined; y?: number | undefined }
  ): void;
  getFontSize(): number;
  measureWidth(text: string): number;
  measureText(
    text: string
  ): {
    baseline: number;
    median: number;
    descender: number;
    ascender: number;
    capHeight: number;
    ascent: number;
    height: number;
    width: number;
  };
};
```

### TextBox

```ts
import { TextBox } from "@hex-engine/2d";
```

This Component lays out text in lines, fitting as many words as it can on
one line before continue onto the next. When you use it, it tells you which
lines it rendered, and which parts of the text you provided didn't fit into
the text box (if any). You can use this information to re-render the text
box with new content, once the user has read the text.

```ts
export default function TextBox(options: {
  font: ReturnType<typeof Font | typeof BMFont | typeof SystemFont>,
  size: Point,
  lineHeight: number,
}: {
  drawText(
      context: CanvasRenderingContext2D,
      text: string,
      location?: {
        x?: number;
        y?: number;
      }
    ): {
        /** A boolean indicating whether all the text that was provided fit into the textbox. */
        didTextFit: boolean;

        /** A string containing any remaining text that didn't fit into the box. */
        remainingText: string;

        /** An Array containing all the lines that were printed. */
        printedLines: Array<string>,
      }
}
```

### Tiled.Tileset

```ts
import { Tiled } from "@hex-engine/2d";
import someTileset from "./someTileset.xml";

Tiled.Tileset(someTileset);
```

This Component loads data from a Tiled XML tileset file and creates a `SpriteSheet` Component out of it.

```ts
function Tileset(
  data: XMLSourceLoader.Element
): {
  spriteSheet: ReturnType<typeof SpriteSheet>;
};
```

### Tiled.Layer

```ts
import { Tiled } from "@hex-engine/2d";

Tiled.Layer;
```

This Component represents the data for a single layer within a Tiled map XML file.

You'll rarely create it directly; instead, you'll get it from a Tiled.Map.

```ts
function Layer(
  layer: XMLSourceLoader.Element
): {
  grid: Grid<number>;
  visible: boolean;
};
```

### Tiled.Map

```ts
import { Tiled } from "@hex-engine/2d";
import someMap from "./someMap.xml";

Tiled.Map(someMap);
```

This Component loads data from a Tiled map XML file and creates
SpriteSheet and TileMap Components that you can use to draw the
map into the canvas.

```ts
function TiledMap(
  data: XMLSourceLoader.Element
): {
  /** The tileset used by the map */
  tileset: ReturnType<typeof Tiled.Tileset>;

  /** An Array of Tiled.Layer Compponents, each corresponding to a layer in the Tiled map */
  layers: Array<ReturnType<typeof Tiled.Layer>>;

  /** An Array of TileMap Components, each corresponding to a *visible* layer in the Tiled map */
  tileMaps: Array<ReturnType<typeof TileMap>>;

  /** The size of the map in tiles */
  sizeInTiles: Point;

  /** The size of the map in pixels */
  sizeInPixels: Point;

  /** The size of a single tile in the map */
  tileSize: Point;

  /** All the objects that were present in the map, for you to use however you like */
  objects: Array<
    | {
        kind: "string";
        object: string;
      }
    | {
        kind: "unknown";
        object: XMLSourceLoader.Element;
        id: string;
        name: string;
        location: Point;
        size?: Point;
        properties: Array<{
          name: string;
          value: string;
          type: "bool" | "color" | "float" | "file" | "int" | "string";
        }>;
      }
    | {
        kind: "point";
        object: XMLSourceLoader.Element;
        id: string;
        name: string;
        location: Point;
        size?: Point;
        properties: Array<{
          name: string;
          value: string;
          type: "bool" | "color" | "float" | "file" | "int" | "string";
        }>;
      }
    | {
        kind: "ellipse";
        object: XMLSourceLoader.Element;
        id: string;
        name: string;
        location: Point;
        size?: Point;
        properties: Array<{
          name: string;
          value: string;
          type: "bool" | "color" | "float" | "file" | "int" | "string";
        }>;
      }
    | {
        kind: "text";
        object: XMLSourceLoader.Element;
        id: string;
        name: string;
        location: Point;
        size?: Point;
        properties: Array<{
          name: string;
          value: string;
          type: "bool" | "color" | "float" | "file" | "int" | "string";
        }>;
      }
    | {
        kind: "polygon";
        points: Array<Point>;
        object: XMLSourceLoader.Element;
        id: string;
        name: string;
        location: Point;
        size?: Point;
        properties: Array<{
          name: string;
          value: string;
          type: "bool" | "color" | "float" | "file" | "int" | "string";
        }>;
      }
  >;
};
```

### TileMap

```ts
import { TileMap } from "@hex-engine/2d";
```

This Component uses a Grid of tile indices and a SpriteSheet Component to draw a large map of tiles to the canvas.

```ts
function TileMap(
  sheet: ReturnType<typeof SpriteSheet>,
  grid: Grid<number>
): {
  draw(
    context: CanvasRenderingContext2D,
    position?: {
      x?: number | void;
      y?: number | void;
    } = {}
  ): void;
};
```

### Timer

```ts
import { Timer } from "@hex-engine/2d";
```

This Component can be used to check how far the current time is from some desired time in the future.

```ts
function Timer(): {
  setToTimeFromNow(msFromNow: number): void;
  distanceFromSetTime(): void;
  hasReachedSetTime(): void;
};
```

## Hooks

`@hex-engine/2d` comes with several hook functions you can use within your own Component functions.

### useBackstage

```ts
import { useBackstage } from "@hex-engine/2d";
```

`useBackstage(): CanvasRenderingContext2D`

Returns a "backstage" canvas context that gets cleared between every component draw.
The canvas associated with this backstage context is never shown to the user.
You can use this backstage context as a working space to render into, if needed.

### useContext

```ts
import { useContext } from "@hex-engine/2d";
```

`useContext(): CanvasRenderingContext2D`

Returns the 2d rendering context of the root component's Canvas.

This is the same context that gets passed into `useDraw`'s callback.

### useDraw

```ts
import { useDraw } from "@hex-engine/2d";
```

`export default function useDraw(onDraw: (context: CanvasRenderingContext2D, backstage: CanvasRenderingContext2D) => void, { roundToNearestPixel: boolean }?): void`

Register a function to be called once per frame, after all `useUpdate` functions have been called.

The function will receive a 2d canvas context it can draw into.

The context you receive will already be rotated and translated such that position 0, 0 is the upper-left corner of the current Entity, so in most cases, you will not need to worry about x/y positioning.

### useUpdate

```ts
import { useUpdate } from "@hex-engine/2d";
```

`useUpdate(callback: (delta: number) => void): void`

Registers a function to be called once every frame, prior to drawing.

The function will receive a single argument, `delta`, which is the number of milliseconds
that have passed since the last frame was rendered.

### useEntitiesAtPoint

```ts
import { useEntitiesAtPoint } from "@hex-engine/2d";
```

`useEntitiesAtPoint(worldPos: Point): Array<Entity>`

Get all the entities at the given world position,
sorted by reverse draw order, such that one that
gets drawn last (and is therefore on top) is the first in the array.

### useEntityTransforms

```ts
import { useEntityTransforms } from "@hex-engine/2d";
```

`useEntityTransforms(entity?: Entity): { matrixForWorldPosition: () => TransformMatrix, matrixForDrawPosition: () => TransformMatrix }`

Get the matrix transforms for the specified Entity, or the current Entity if no entity is provided.

### useFilledPixelBounds

```ts
import { useFilledPixelBounds } from "@hex-engine/2d";
```

`useFilledPixelBounds(context: CanvasRenderingContext2D): { minX: number; maxX: number; minY: number; maxY: number; }`

Searches through the provided canvas context for non-transparent pixels
and identifies a bounding box that contains them.

> Warning: This function is expensive. Avoid using it on every frame.

### useInspectorHoverOutline

```ts
import { useInspectorHoverOutline } from "@hex-engine/2d";
```

`useInspectorHoverOutline(getShape: () => Polygon | Circle)`

Sets up the Inspector so that when the current Entity or Component is hovered over,
the provided function will be called to get a shape that should be drawn onto the screen.

This function does nothing in release builds.

### useRawDraw

```ts
import { useRawDraw } from "@hex-engine/2d";
```

`useRawDraw(callback: (context: CanvasRenderingContext2D, backstage: CanvasRenderingContext2D) => void): void`

Registers a function to be called once a frame, after all `useUpdate` functions have been called.

Unlike `useDraw`, `useRawDraw` does _not_ transform the context by the current Entity's matrix transform.

In most cases, you should use `useDraw` instead of `useRawDraw`.

### useDebugOverlayDrawTime

```ts
import { useDebugOverlayDrawTime } from "@hex-engine/2d";
```

`useDebugOverlayDrawTime(): void`

This hook specifies to the default draw order sort function
that this Component's draw callbacks should be drawn last,
after everything else, because this component renders debug overlay(s)
that should be drawn on top of everything else.

If you are using a custom draw order sort and want to preserve this functionality,
you can use the `Canvas.DrawOrder.isDebugOverlay` function to identify Components
that have called this hook.

### useCanvasDrawOrderSort

```ts
import { useCanvasDrawOrderSort } from "@hex-engine/2d";
```

This component will check the root Entity for a Canvas.DrawOrder component, and if it is present, it will return its `sort` function. Otherwise, it returns `Canvas.DrawOrder.defaultSort`.

### useFirstClick

```ts
import { useFirstClick } from "@hex-engine/2d";
```

`useFirstClick(handler: () => void): void`

This function will run the provided function the first time a mouse click occurs.
Note that it only works if there is at least one `Mouse` or `LowLevelMouse` Component
loaded in your game when the first click occurs. To be on the safe side, you should
probably also add a LowLevelMouse or Mouse Component to the Component that calls useFirstClick.

### useFirstKey

```ts
import { useFirstKey } from "@hex-engine/2d";
```

`useFirstKey(handler: () => void): void`

This function will run the provided function the first time a key is pressed.
Note that it only works if there is at least one `Keyboard` Component loaded in
your game when the first keypress occurs. To be on the safe side, you should
probably also add a Keyboard Component to the Component that calls useFirstKey.

### useAudioContext

```ts
import { useAudioContext } from "@hex-engine/2d";
```

`useAudioContext(): AudioContext | null`

Retrieve the current AudioContext from the root Entity's `AudioContext` component, if any.

## Other

### Preloader

```ts
import { Preloader } from "@hex-engine/2d";
```

A class that helps ensure used resources are loaded before they are used.

When resources that must be fetched over the network are created (such as Images and Audio),
they register themselves with thie Preloader. To wait until all registered resources have been
loaded, use `Preloader.load().then(() => {})`.

#### Methods

##### addTask

`addTask(task: () => Promise<any>): void`

Adds a new task to the Preloader. It will start running immediately.

##### load

`load(): Promise<void>`

Returns a Promise which does not resolve until all tasks that have been added to the Preloader have resolved.

[`@hex-engine/core`]: api-core
[`angle`]: #angle
[`circle`]: #circle
[`grid`]: #grid
[`point`]: #point
[`polygon`]: #polygon
[`transformmatrix`]: #transformmatrix
[`vector`]: #vector
