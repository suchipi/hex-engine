/// <reference types="@test-it/core/globals" />
import {
  Entity,
  useCallbackAsCurrent,
  useChild,
  useNewComponent,
  useType,
} from "@hex-engine/core";
import Geometry from "../Components/Geometry";
import { Circle, Polygon, Vector } from "../Models";
import { endGame, startGame } from "../Components/inputTestSetup";
import useEntitiesAtPoint from "./useEntitiesAtPoint";

afterEach(endGame);

/** Runs useEntitiesAtPoint from inside a Component, which is where hooks work. */
function entitiesAt(root: Entity, x: number, y: number): Array<Entity> {
  let found: Array<Entity> = [];

  root.addComponent(function Probe() {
    useType(Probe);
    found = useEntitiesAtPoint(new Vector(x, y));
  });

  return found;
}

function Box(position: Vector, size: number = 40) {
  useType(Box);
  useNewComponent(() =>
    Geometry({ shape: Polygon.rectangle(size, size), position })
  );
}

test("an Entity whose shape covers the point is returned", () => {
  let box!: Entity;

  const root = startGame(() => {
    box = useChild(() => Box(new Vector(100, 100)));
  });

  expect(entitiesAt(root, 100, 100)).toEqual([box]);
  expect(entitiesAt(root, 119, 119)).toEqual([box]);
});

test("nothing is returned for a point no Entity covers", () => {
  const root = startGame(() => {
    useChild(() => Box(new Vector(100, 100)));
  });

  expect(entitiesAt(root, 300, 300)).toEqual([]);
});

test("Entities with no Geometry are never returned", () => {
  const root = startGame(() => {
    useChild(function NoGeometry() {
      useType(NoGeometry);
    });
  });

  expect(entitiesAt(root, 0, 0)).toEqual([]);
});

test("overlapping Entities come back with the topmost first", () => {
  let lower!: Entity;
  let upper!: Entity;

  const root = startGame(() => {
    lower = useChild(() => Box(new Vector(100, 100), 100));
    upper = useChild(() => Box(new Vector(100, 100), 50));
  });

  // Later-created Entities draw on top, so they lead the list.
  expect(entitiesAt(root, 100, 100)).toEqual([upper, lower]);
});

test("only the Entities actually covering the point are included", () => {
  let lower!: Entity;

  const root = startGame(() => {
    lower = useChild(() => Box(new Vector(100, 100), 100));
    useChild(() => Box(new Vector(100, 100), 50));
  });

  // Outside the small box, but still inside the big one.
  expect(entitiesAt(root, 140, 100)).toEqual([lower]);
});

test("hit testing uses the Entity's shape, not its bounding box", () => {
  let ball!: Entity;

  const root = startGame(() => {
    ball = useChild(function Ball() {
      useType(Ball);
      useNewComponent(() =>
        Geometry({ shape: new Circle(20), position: new Vector(100, 100) })
      );
    });
  });

  expect(entitiesAt(root, 100, 100)).toEqual([ball]);
  expect(entitiesAt(root, 118, 118)).toEqual([]);
});

test("hit testing accounts for scale", () => {
  let box!: Entity;

  const root = startGame(() => {
    box = useChild(function Scaled() {
      useType(Scaled);
      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(40, 40),
          position: new Vector(200, 200),
          scale: new Vector(2, 2),
        })
      );
    });
  });

  expect(entitiesAt(root, 235, 200)).toEqual([box]);
  expect(entitiesAt(root, 245, 200)).toEqual([]);
});

test("hit testing accounts for rotation", () => {
  let bar!: Entity;

  const root = startGame(() => {
    bar = useChild(function Bar() {
      useType(Bar);
      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(40, 10),
          position: new Vector(200, 200),
          rotation: Math.PI / 2,
        })
      );
    });
  });

  expect(entitiesAt(root, 200, 215)).toEqual([bar]);
  expect(entitiesAt(root, 215, 200)).toEqual([]);
});

test("hit testing accounts for a parent's transform", () => {
  let kid!: Entity;

  const root = startGame(() => {
    const parent = useChild(function Parent() {
      useType(Parent);
      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(200, 200),
          position: new Vector(100, 100),
        })
      );
      return { addChild: useCallbackAsCurrent(useChild) };
    });

    kid = parent.rootComponent.addChild(function Kid() {
      useType(Kid);
      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(20, 20),
          position: new Vector(30, 30),
        })
      );
    });
  });

  // The kid sits at 30,30 within a parent that starts at 0,0, so it covers
  // 130,130 in world space and not 30,30.
  expect(entitiesAt(root, 130, 130)).toContain(kid);
  expect(entitiesAt(root, 30, 30)).not.toContain(kid);
});

test("the root Entity is included when it has a Geometry of its own", () => {
  const root = startGame(() => {
    useNewComponent(() =>
      Geometry({
        shape: Polygon.rectangle(40, 40),
        position: new Vector(50, 50),
      })
    );
  });

  expect(entitiesAt(root, 50, 50)).toEqual([root]);
});

test("results are computed fresh for each point", () => {
  let left!: Entity;
  let right!: Entity;

  const root = startGame(() => {
    left = useChild(() => Box(new Vector(100, 100)));
    right = useChild(() => Box(new Vector(300, 100)));
  });

  expect(entitiesAt(root, 100, 100)).toEqual([left]);
  expect(entitiesAt(root, 300, 100)).toEqual([right]);
  expect(entitiesAt(root, 200, 100)).toEqual([]);
});

test("a destroyed Entity stops being returned", () => {
  let box!: Entity;

  const root = startGame(() => {
    box = useChild(() => Box(new Vector(100, 100)));
  });

  expect(entitiesAt(root, 100, 100)).toEqual([box]);

  box.destroy();

  expect(entitiesAt(root, 100, 100)).toEqual([]);
});
