/// <reference types="@test-it/core/globals" />
import { Entity, useChild, useNewComponent, useType } from "@hex-engine/core";
import Geometry from "./Geometry";
import * as Physics from "./Physics";
import { Circle, Polygon, Vector } from "../Models";
import { endGame, startGame, step, xy } from "./inputTestSetup";

afterEach(endGame);

type BodyApi = ReturnType<typeof Physics.Body>;

function Box({
  position,
  isStatic = false,
  shape = Polygon.rectangle(20, 20),
  onBody,
}: {
  position: Vector;
  isStatic?: boolean;
  shape?: Polygon | Circle;
  onBody?: (body: BodyApi, geometry: ReturnType<typeof Geometry>) => void;
}) {
  useType(Box);

  const geometry = useNewComponent(() => Geometry({ shape, position }));
  const body = useNewComponent(() => Physics.Body(geometry, { isStatic }));

  if (onBody) onBody(body, geometry);

  return { geometry, body };
}

function startWithEngine(
  scene: () => void,
  engineOptions: Parameters<typeof Physics.Engine>[0] = {}
) {
  return startGame(() => {
    useNewComponent(() => Physics.Engine(engineOptions));
    scene();
  });
}

test("an Engine can be created on the root Entity", () => {
  const root = startWithEngine(() => {});

  expect(root.hasComponent(Physics.Engine)).toBe(true);
});

test("a Body puts a Matter body into the world", () => {
  let body!: BodyApi;

  startWithEngine(() => {
    useChild(() => {
      const made = Box({ position: new Vector(50, 50) });
      body = made.body;
    });
  });

  expect(body.body).not.toBe(undefined);
  expect(xy(body.body.position)).toEqual({ x: 50, y: 50 });
});

test("gravity pulls a body downward over successive frames", () => {
  let geometry!: ReturnType<typeof Geometry>;

  startWithEngine(() => {
    useChild(() => {
      geometry = Box({ position: new Vector(50, 50) }).geometry;
    });
  });

  const startY = geometry.position.y;

  for (let index = 0; index < 10; index++) step();

  expect(geometry.position.y).toBeGreaterThan(startY);
  expect(geometry.position.x).toBeCloseTo(50, 3);
});

test("zero gravity leaves a body where it was put", () => {
  let geometry!: ReturnType<typeof Geometry>;

  startWithEngine(
    () => {
      useChild(() => {
        geometry = Box({ position: new Vector(50, 50) }).geometry;
      });
    },
    { gravity: new Vector(0, 0) }
  );

  for (let index = 0; index < 10; index++) step();

  expect(xy(geometry.position)).toEqual({ x: 50, y: 50 });
});

test("gravity can be pointed sideways", () => {
  let geometry!: ReturnType<typeof Geometry>;

  startWithEngine(
    () => {
      useChild(() => {
        geometry = Box({ position: new Vector(50, 50) }).geometry;
      });
    },
    { gravity: new Vector(1, 0) }
  );

  for (let index = 0; index < 10; index++) step();

  expect(geometry.position.x).toBeGreaterThan(50);
});

test("a static body does not fall", () => {
  let geometry!: ReturnType<typeof Geometry>;

  startWithEngine(() => {
    useChild(() => {
      geometry = Box({
        position: new Vector(50, 50),
        isStatic: true,
      }).geometry;
    });
  });

  for (let index = 0; index < 10; index++) step();

  expect(xy(geometry.position)).toEqual({ x: 50, y: 50 });
});

test("moving a static body's Geometry moves its physics body to match", () => {
  let geometry!: ReturnType<typeof Geometry>;
  let body!: BodyApi;

  startWithEngine(() => {
    useChild(() => {
      const made = Box({ position: new Vector(50, 50), isStatic: true });
      geometry = made.geometry;
      body = made.body;
    });
  });

  geometry.position.mutateInto({ x: 120, y: 30 });
  step();

  expect(xy(body.body.position)).toEqual({ x: 120, y: 30 });
});

test("a falling body lands on a static one instead of passing through", () => {
  let faller!: ReturnType<typeof Geometry>;

  startWithEngine(() => {
    useChild(() => {
      faller = Box({ position: new Vector(50, 20) }).geometry;
    });
    useChild(() => {
      Box({
        position: new Vector(50, 200),
        isStatic: true,
        shape: Polygon.rectangle(200, 20),
      });
    });
  });

  for (let index = 0; index < 200; index++) step();

  // Resting on top of the platform, not through it.
  expect(faller.position.y).toBeGreaterThan(20);
  expect(faller.position.y).toBeLessThan(200);
});

test("setVelocity sends a body moving", () => {
  let geometry!: ReturnType<typeof Geometry>;
  let body!: BodyApi;

  startWithEngine(
    () => {
      useChild(() => {
        const made = Box({ position: new Vector(50, 50) });
        geometry = made.geometry;
        body = made.body;
      });
    },
    { gravity: new Vector(0, 0) }
  );

  body.setVelocity(new Vector(5, 0));
  for (let index = 0; index < 5; index++) step();

  expect(geometry.position.x).toBeGreaterThan(50);
});

test("setPosition moves a body outright", () => {
  let body!: BodyApi;

  startWithEngine(
    () => {
      useChild(() => {
        body = Box({ position: new Vector(50, 50) }).body;
      });
    },
    { gravity: new Vector(0, 0) }
  );

  body.setPosition(new Vector(10, 20));
  step();

  expect(body.body.position.x).toBeCloseTo(10, 3);
});

test("setStatic freezes a body that was falling", () => {
  let geometry!: ReturnType<typeof Geometry>;
  let body!: BodyApi;

  startWithEngine(() => {
    useChild(() => {
      const made = Box({ position: new Vector(50, 50) });
      geometry = made.geometry;
      body = made.body;
    });
  });

  for (let index = 0; index < 5; index++) step();
  body.setStatic(true);

  const restingAt = xy(geometry.position);
  for (let index = 0; index < 10; index++) step();

  expect(xy(geometry.position)).toEqual(restingAt);
});

test("setAngle turns a body, and the Geometry follows", () => {
  let geometry!: ReturnType<typeof Geometry>;
  let body!: BodyApi;

  startWithEngine(
    () => {
      useChild(() => {
        const made = Box({ position: new Vector(50, 50) });
        geometry = made.geometry;
        body = made.body;
      });
    },
    { gravity: new Vector(0, 0) }
  );

  body.setAngle(1);
  step();

  expect(geometry.rotation).toBeCloseTo(1, 3);
});

test("a circular Geometry makes a circular body", () => {
  let body!: BodyApi;

  startWithEngine(() => {
    useChild(() => {
      body = Box({
        position: new Vector(50, 50),
        shape: new Circle(10),
      }).body;
    });
  });

  // Matter records the radius it was built from only for circular bodies.
  expect((body.body as { circleRadius?: number }).circleRadius).toBe(10);
});

test("a Geometry whose shape is neither a polygon nor a circle is reported", () => {
  const logged: Array<unknown> = [];
  const realConsoleError = console.error;
  console.error = (...args: Array<unknown>) => {
    logged.push(args[0]);
  };

  try {
    startWithEngine(() => {
      useChild(function Broken() {
        useType(Broken);

        const geometry = useNewComponent(() =>
          Geometry({ shape: Polygon.rectangle(10, 10) })
        );
        // A shape with neither points nor a radius.
        (geometry as { shape: unknown }).shape = {};

        useNewComponent(() => Physics.Body(geometry));
      });
    });
  } finally {
    console.error = realConsoleError;
  }

  expect(logged.length).toBe(1);
  expect(String((logged[0] as Error).message)).toContain("Unknown shape type");
});

test("onCollision reports when two bodies touch", () => {
  const collisions: Array<string> = [];

  startWithEngine(() => {
    useChild(() => {
      Box({
        position: new Vector(50, 20),
        onBody: (body) => {
          body.onCollision((info) => collisions.push(info.kind));
        },
      });
    });
    useChild(() => {
      Box({
        position: new Vector(50, 120),
        isStatic: true,
        shape: Polygon.rectangle(200, 20),
      });
    });
  });

  for (let index = 0; index < 200; index++) step();

  expect(collisions).toContain("start");
});

test("a collision report names the other Entity", () => {
  let seen: null | Entity = null;
  let platform!: Entity;

  startWithEngine(() => {
    useChild(() => {
      Box({
        position: new Vector(50, 20),
        onBody: (body) => {
          body.onCollision((info) => {
            seen = seen || info.entity;
          });
        },
      });
    });
    platform = useChild(() => {
      Box({
        position: new Vector(50, 120),
        isStatic: true,
        shape: Polygon.rectangle(200, 20),
      });
    });
  });

  for (let index = 0; index < 200; index++) step();

  expect(seen).toBe(platform);
});

test("destroying an Entity takes its body out of the simulation", () => {
  let entity!: Entity;
  let otherGeometry!: ReturnType<typeof Geometry>;

  startWithEngine(() => {
    entity = useChild(() => {
      Box({
        position: new Vector(50, 120),
        isStatic: true,
        shape: Polygon.rectangle(200, 20),
      });
    });
    useChild(() => {
      otherGeometry = Box({ position: new Vector(50, 20) }).geometry;
    });
  });

  entity.destroy();

  for (let index = 0; index < 200; index++) step();

  // With the platform gone, nothing stops the fall.
  expect(otherGeometry.position.y).toBeGreaterThan(200);
});

test("a Constraint holds two bodies together", () => {
  let first!: ReturnType<typeof Geometry>;
  let second!: ReturnType<typeof Geometry>;

  startWithEngine(() => {
    let firstBody!: BodyApi;
    let secondBody!: BodyApi;

    useChild(() => {
      const made = Box({ position: new Vector(50, 50), isStatic: true });
      first = made.geometry;
      firstBody = made.body;
    });
    useChild(() => {
      const made = Box({ position: new Vector(50, 100) });
      second = made.geometry;
      secondBody = made.body;
    });

    useNewComponent(() =>
      Physics.Constraint({
        bodyA: firstBody.body,
        bodyB: secondBody.body,
        length: 50,
        stiffness: 1,
      })
    );
  });

  for (let index = 0; index < 100; index++) step();

  // Hanging from a static anchor rather than falling away forever.
  expect(second.position.y - first.position.y).toBeLessThan(200);
});
