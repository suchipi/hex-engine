/// <reference types="@test-it/core/globals" />
import {
  Entity,
  useCallbackAsCurrent,
  useChild,
  useNewComponent,
  useType,
} from "@hex-engine/core";
import { Circle, Polygon, Vector } from "../Models";
import Geometry from "./Geometry";
import Mouse from "./Mouse";
import { endGame, startGame, xy } from "./inputTestSetup";

const TAU = Math.PI * 2;

afterEach(endGame);

function startWithGeometry(
  options: Partial<Parameters<typeof Geometry>[0]> = {}
): ReturnType<typeof Geometry> {
  let geometry!: ReturnType<typeof Geometry>;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);
      geometry = useNewComponent(() =>
        Geometry({ shape: Polygon.rectangle(40, 40), ...options })
      );
    });
  });

  return geometry;
}

test("everything but the shape has a default", () => {
  const geometry = startWithGeometry();

  expect(xy(geometry.position)).toEqual({ x: 0, y: 0 });
  expect(geometry.rotation).toBe(0);
  expect(xy(geometry.scale)).toEqual({ x: 1, y: 1 });
  expect(xy(geometry.origin)).toEqual({ x: 0, y: 0 });
});

test("the shape, position, scale, and origin are the exact objects passed in", () => {
  const shape = Polygon.rectangle(10, 10);
  const position = new Vector(1, 2);
  const scale = new Vector(3, 4);
  const origin = new Vector(5, 6);

  const geometry = startWithGeometry({ shape, position, scale, origin });

  expect(geometry.shape).toBe(shape);
  expect(geometry.position).toBe(position);
  expect(geometry.scale).toBe(scale);
  expect(geometry.origin).toBe(origin);
});

test("position, rotation, scale, and shape can all be changed afterward", () => {
  const geometry = startWithGeometry();
  const replacement = new Circle(5);

  geometry.position.mutateInto({ x: 10, y: 20 });
  geometry.rotation = 1;
  geometry.scale.mutateInto({ x: 2, y: 2 });
  geometry.shape = replacement;

  expect(xy(geometry.position)).toEqual({ x: 10, y: 20 });
  expect(geometry.rotation).toBe(1);
  expect(geometry.shape).toBe(replacement);
});

test("a rotation of more than a full turn is wrapped back into range", () => {
  const geometry = startWithGeometry({ rotation: TAU + 1 });

  expect(geometry.rotation).toBeCloseTo(1, 10);

  geometry.rotation = TAU * 3 + 2;
  expect(geometry.rotation).toBeCloseTo(2, 10);
});

test("a negative rotation is wrapped up into range", () => {
  const geometry = startWithGeometry({ rotation: -TAU * 3 });

  expect(geometry.rotation).toBeCloseTo(0, 10);

  geometry.rotation = -Math.PI / 2;
  expect(geometry.rotation).toBeCloseTo(TAU - Math.PI / 2, 10);
});

test("a rotation of exactly one full turn wraps to zero", () => {
  const geometry = startWithGeometry({ rotation: TAU });

  expect(geometry.rotation).toBe(0);
});

test("every rotation ends up somewhere in a single turn", () => {
  const geometry = startWithGeometry();

  for (const rotation of [-1000, -TAU, -0.5, 0, 0.5, TAU, 1000]) {
    geometry.rotation = rotation;
    expect(geometry.rotation).toBeGreaterThanOrEqual(0);
    expect(geometry.rotation).toBeLessThan(TAU);
  }
});

test("worldPosition is the position for an Entity with no parent", () => {
  const geometry = startWithGeometry({ position: new Vector(30, 40) });

  expect(xy(geometry.worldPosition())).toEqual({ x: 30, y: 40 });
});

test("worldPosition adds up the positions of every ancestor", () => {
  let kid!: ReturnType<typeof Geometry>;

  startGame(() => {
    const parent = useChild(function Parent() {
      useType(Parent);

      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(100, 100),
          position: new Vector(100, 200),
        })
      );

      return { addChild: useCallbackAsCurrent(useChild) };
    });

    parent.rootComponent.addChild(function Kid() {
      useType(Kid);

      kid = useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(10, 10),
          position: new Vector(30, 40),
        })
      );
    });
  });

  expect(xy(kid.worldPosition())).toEqual({ x: 130, y: 240 });
});

test("worldPosition accounts for the Entity's own origin", () => {
  const geometry = startWithGeometry({
    position: new Vector(100, 100),
    origin: new Vector(5, 7),
  });

  // The origin moves the shape by -origin, and worldPosition is where the
  // shape's center ends up.
  expect(xy(geometry.worldPosition())).toEqual({ x: 95, y: 93 });
});

test("known quirk: worldPosition ignores an ancestor's origin", () => {
  let kid!: ReturnType<typeof Geometry>;

  startGame(() => {
    const parent = useChild(function Parent() {
      useType(Parent);

      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(100, 100),
          position: new Vector(100, 100),
          origin: new Vector(50, 50),
        })
      );

      return { addChild: useCallbackAsCurrent(useChild) };
    });

    parent.rootComponent.addChild(function Kid() {
      useType(Kid);

      kid = useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(10, 10),
          position: new Vector(10, 10),
        })
      );
    });
  });

  // Ancestor transforms are gathered without their origins, which is what the
  // parentChildWorldPositions integration test calls out as intentional, but it
  // does mean a parent's origin moves its drawing and not its children.
  expect(xy(kid.worldPosition())).toEqual({ x: 110, y: 110 });
});

test("worldPosition follows the Entity as it moves", () => {
  const geometry = startWithGeometry({ position: new Vector(0, 0) });

  expect(xy(geometry.worldPosition())).toEqual({ x: 0, y: 0 });

  geometry.position.mutateInto({ x: 15, y: 25 });

  expect(xy(geometry.worldPosition())).toEqual({ x: 15, y: 25 });
});

test("worldPosition returns a new Vector every time", () => {
  const geometry = startWithGeometry();

  expect(geometry.worldPosition()).not.toBe(geometry.worldPosition());
});

test("a rotated Entity's worldPosition still sits at its position", () => {
  const geometry = startWithGeometry({
    position: new Vector(50, 60),
    rotation: Math.PI / 3,
  });

  const world = geometry.worldPosition();
  expect(world.x).toBeCloseTo(50, 10);
  expect(world.y).toBeCloseTo(60, 10);
});

test("known quirk: outside production, every Geometry builds a Mouse of its own", () => {
  let entity!: Entity;

  startGame(() => {
    entity = useChild(function Subject() {
      useType(Subject);
      useNewComponent(() => Geometry({ shape: Polygon.rectangle(10, 10) }));
    });
  });

  // useInspectorSelectEntity attaches a Mouse so the inspector can click the
  // Entity, which means any Entity with a Geometry is paying for mouse
  // hit-testing whether or not the game asked for it.
  expect(entity.hasComponent(Mouse)).toBe(true);
});
