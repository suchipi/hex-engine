---
title: "@hex-engine/2d"
---

`@hex-engine/2d` is the main package that you will interact with when using Hex Engine. It has several named exports, which are each documented here.

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

##### `Angle.fromPoints(first: Point, second: Point):`[`Angle`]

Calculates the angle of the vector whose tail is at the [`Point`] `first` and whose head
is at the [`Point`] `second`.

#### Properties

##### `radians: number`

The angle, in radians.

#### Methods

##### `clone():`[`Angle`]

Creates a copy of this `Angle`.

##### `toPoint():`[`Point`]

Calculates the position of the head of a unit vector (a vector with magnitude `1`) with the given angle
whose tail is at the origin.

Returns a [`Point`].

##### `add(amount: number |`[`Angle`]`):`[`Angle`]

Returns a new Angle whose value is equivalent to the value of the
current Angle plus the specified amount.

This rotates the Angle clockwise.

##### `addMutate(amount: number | Angle): this`

Mutates the current Angle, adding the specified amount to its current value.

This rotates the Angle clockwise.

##### `subtract(amount: number | Angle):`[`Angle`]

Returns a new Angle whose value is equivalent to the value of the
current Angle minus the specified amount.

This rotates the Angle counter-clockwise.

##### `subtractMutate(amount: number | Angle): this`

Mutates the current Angle, subtracting the specified amount from its current value.

This rotates the Angle counter-clockwise.

### Circle

Represents a circle; a shape with infinite points along its edge that are all
equidistant from its center.

The distance between the center and the edge points is known as the circle's
radius.

#### Properties

##### `radius: number`

The radius of this circle; the length of a line segment that starts at the
circle's center and goes to its edge.

##### `diameter: number`

The diameter of this circle; the length of a line segment that starts at
the circle's edge, crosses through the circle's center, and continues to
the opposite edge.

##### `width: number`

The width of this circle; same as the diameter.

##### `height: number`

The height of this circle; same as the diameter.

##### `bounds:`[`Point`]

The size of the bounding rectangle around this circle.

#### Methods

##### `boundingRectangle():`[`Polygon`]

Creates a rectangular polygon whose width and height are double this circle's radius;
said in other words, returns the rectangle that this circle could be perfectly
[inscribed](https://www.mathopenref.com/inscribed.html) in.

##### `containsPoint(point:`[`Point`]`): boolean`

### Grid

### Point

### Polygon

### TransformMatrix

### Vector

[`@hex-engine/core`]: api-core
[`angle`]: #angle
[`circle`]: #circle
[`grid`]: #grid
[`point`]: #point
[`polygon`]: #polygon
[`transformmatrix`]: #transformmatrix
[`vector`]: #vector
