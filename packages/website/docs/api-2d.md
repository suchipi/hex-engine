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

TODO

## Components

TODO

### Canvas

TODO

### Canvas.DrawOrder

TODO

### Animation

TODO

### AnimationSheet

TODO

### Aseprite

TODO

### Audio

TODO

### AudioContext

TODO

### BMFont

TODO

### FontMetrics

TODO

### Gamepad

TODO

### Geometry

TODO

### Image

TODO

### ImageFilter

TODO

### Keyboard

TODO

### Label

TODO

### LowLevelMouse

TODO

### Mouse

TODO

### Physics.Engine

TODO

### Physics.Body

TODO

### Physics.Constraint

TODO

### ProcceduralSfx

TODO

### SpriteSheet

TODO

### SystemFont

TODO

### TextBox

TODO

### Tiled.Tileset

TODO

### Tiled.Layer

TODO

### Tiled.Map

TODO

### TileMap

TODO

### Timer

TODO

## Hooks

TODO

### useBackstage

TODO

### useContext

TODO

### useDraw

TODO

### useUpdate

TODO

### useEntitiesAtPoint

TODO

### useEntityTransforms

TODO

### useFilledPixelBounds

TODO

### useInspectorHoverOutline

TODO

### useRawDraw

TODO

### useDebugOverlayDrawTime

TODO

### useCanvasDrawOrderSort

TODO

### useFirstClick

TODO

### useFirstKey

TODO

### useAudioContext

TODO

## Other

### Preloader

TODO

[`@hex-engine/core`]: api-core
[`angle`]: #angle
[`circle`]: #circle
[`grid`]: #grid
[`point`]: #point
[`polygon`]: #polygon
[`transformmatrix`]: #transformmatrix
[`vector`]: #vector
