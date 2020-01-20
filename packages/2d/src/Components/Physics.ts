import {
  useType,
  useRootEntity,
  useDestroy,
  useEntity,
  Entity,
  useCallbackAsCurrent,
  useNewComponent,
} from "@hex-engine/core";
import Matter from "matter-js";
import Geometry from "./Geometry";
import { Angle, Point, Polygon, Circle } from "../Models";
import {
  useUpdate,
  useContext,
  useDraw,
  useDebugOverlayDrawTime,
} from "../Hooks";

// Matter needs this
// @ts-ignore
global.decomp = require("poly-decomp");

function name<T>(name: string, fn: T): T {
  Object.defineProperty(fn, "name", { value: name });
  return fn;
}

type CollisionListener = (other: {
  body: Matter.Body;
  entity: null | Entity;
}) => void;

function PhysicsEngine({
  debugDraw = false,
  gravity = new Point(0, 1),
  enableSleeping = true,
}: {
  debugDraw?: boolean;
  gravity?: Point;
  enableSleeping?: boolean;
} = {}) {
  useType(PhysicsEngine);

  const engine = Matter.Engine.create(undefined, {
    enableSleeping,
  });
  engine.world.gravity.x = gravity.x;
  engine.world.gravity.y = gravity.y;

  const { addCollisionListener } = useNewComponent(() =>
    PhysicsCollisionsListeners(engine)
  );

  let lastDelta: number | null = null;
  useUpdate((delta) => {
    if (delta > 100) {
      // Don't freeze up the main thread by making the engine calculate a ton of iterations.
      Matter.Engine.update(engine, 16.66);
      return;
    }

    if (lastDelta != null) {
      Matter.Engine.update(engine, delta, delta / lastDelta);
    } else {
      Matter.Engine.update(engine, delta);
    }
  });

  const state = { engine, addCollisionListener, debugDraw };

  function drawComposite(
    context: CanvasRenderingContext2D,
    composite: Matter.Composite
  ) {
    composite.bodies.forEach(drawBody.bind(null, context));
    composite.constraints.forEach(drawConstraint.bind(null, context));
    composite.composites.forEach(drawComposite.bind(null, context));
  }

  function drawBody(context: CanvasRenderingContext2D, body: Matter.Body) {
    body.vertices.reduce((prev, curr) => {
      context.moveTo(prev.x, prev.y);
      context.lineTo(curr.x, curr.y);
      context.stroke();

      return curr;
    }, body.vertices[body.vertices.length - 1]);
  }

  function drawConstraint(
    context: CanvasRenderingContext2D,
    constraint: Matter.Constraint
  ) {
    if (!constraint.bodyA || !constraint.bodyB) return;

    const pos1 = Matter.Vector.add(
      constraint.bodyA.position,
      constraint.pointA
    );
    const pos2 = Matter.Vector.add(
      constraint.bodyB.position,
      constraint.pointB
    );
    context.moveTo(pos1.x, pos1.y);
    context.lineTo(pos2.x, pos2.y);
    context.stroke();
  }

  useDebugOverlayDrawTime();
  useDraw((context) => {
    if (state.debugDraw) {
      context.strokeStyle = "red";
      context.lineWidth = 1;
      drawComposite(context, engine.world);
    }
  });

  return state;
}

function useEngine() {
  const engine = useRootEntity().getComponent(PhysicsEngine)?.engine;
  if (!engine) {
    throw new Error(
      "Attempted to get Physics.Engine component from the root entity, but there wasn't one there.  "
    );
  }
  return engine;
}

function PhysicsCollisionsListeners(engine: Matter.Engine) {
  useType(PhysicsCollisionsListeners);
  const collisionListeners = new WeakMap<Entity, CollisionListener>();

  function addCollisionListener(callback: CollisionListener) {
    const entity = useEntity();
    collisionListeners.set(entity, useCallbackAsCurrent(callback));
  }

  let toProcess: Array<Matter.IPair> = [];

  Matter.Events.on(engine, "collisionStart", (event) => {
    for (const pair of event.pairs) {
      toProcess.push(pair);
    }
  });

  useUpdate(() => {
    for (const pair of toProcess) {
      const { bodyA, bodyB } = pair;
      // @ts-ignore
      const entA: Entity | undefined = bodyA.entity;
      // @ts-ignore
      const entB: Entity | undefined = bodyB.entity;

      if (entA && collisionListeners.has(entA)) {
        const listener = collisionListeners.get(entA);
        if (listener) {
          listener({ body: bodyB, entity: entB || null });
        }
      }
      if (entB && collisionListeners.has(entB)) {
        const listener = collisionListeners.get(entB);
        if (listener) {
          listener({ body: bodyA, entity: entA || null });
        }
      }
    }
    toProcess = [];
  });

  return { addCollisionListener };
}

function useCollisionListener() {
  const addCollisionListener = useRootEntity().getComponent(PhysicsEngine)
    ?.addCollisionListener;
  if (!addCollisionListener) {
    throw new Error(
      "Attempted to get Physics.Engine component from the root entity, but there wasn't one there.  "
    );
  }
  return addCollisionListener;
}

const CollisionCategories = {
  NONE: 0,
  DEFAULT: 1,
  MOUSE_CONSTRAINT: 2,
};

function PhysicsBody(
  geometry: ReturnType<typeof Geometry>,
  {
    collisionCategory = CollisionCategories.DEFAULT,
    collisionMask = CollisionCategories.DEFAULT,
    label = useEntity().name || undefined,
    ...otherOpts
  }: Partial<{
    label: string;
    isStatic: boolean;
    density: number;
    friction: number;
    frictionAir: number;
    isSensor: boolean;
    restitution: number;
    timeScale: number;
    frictionStatic: number;
    collisionCategory: number;
    collisionMask: number;
  }> = {}
) {
  useType(PhysicsBody);

  const engine = useEngine();
  const addCollisionListener = useCollisionListener();

  const opts = {
    collisionFilter: {
      category: collisionCategory,
      mask: collisionMask,
    },
    angle: geometry.rotation.radians,
    label,
    ...otherOpts,
  };

  let body: Matter.Body;
  const worldPos = geometry.worldPosition();

  if ((geometry.shape as Polygon).points) {
    const shape = geometry.shape as Polygon;

    body = Matter.Bodies.fromVertices(
      worldPos.x,
      worldPos.y,
      [shape.points],
      opts
    );
  } else if ((geometry.shape as Circle).radius != null) {
    const shape = geometry.shape as Circle;

    body = Matter.Bodies.circle(worldPos.x, worldPos.y, shape.radius, opts);
  } else {
    throw new Error("Unknown shape type; cannot construct physics body");
  }

  // @ts-ignore
  body.entity = useEntity();

  Matter.Composite.add(engine.world, body);

  useDestroy().onDestroy(() => {
    // @ts-ignore
    body.entity = null;
    Matter.World.remove(engine.world, body, true);
  });

  useUpdate(() => {
    if (body.isStatic) {
      Matter.Body.setPosition(body, geometry.position);
      Matter.Body.setAngle(body, geometry.rotation.radians);
    } else {
      geometry.position.mutateInto(body.position);
      geometry.rotation.radians = body.angle;
    }
  });

  return {
    body,
    applyForce(position: Point, force: Vector) {
      Matter.Body.applyForce(body, position, force.toPoint());
    },
    setAngle(angle: Angle | number) {
      Matter.Body.setAngle(
        body,
        typeof angle === "number" ? angle : angle.radians
      );
    },
    setAngularVelocity(velocity: number) {
      Matter.Body.setAngularVelocity(body, velocity);
    },
    setDensity(density: number) {
      Matter.Body.setDensity(body, density);
    },
    setInertia(inertia: number) {
      Matter.Body.setInertia(body, inertia);
    },
    setMass(mass: number) {
      Matter.Body.setMass(body, mass);
    },
    setPosition(position: Point) {
      Matter.Body.setPosition(body, position);
    },
    setStatic(isStatic: boolean) {
      Matter.Body.setStatic(body, isStatic);
    },
    setVelocity(velocity: Point) {
      Matter.Body.setVelocity(body, velocity);
    },
    onCollision: addCollisionListener,
  };
}

function PhysicsConstraint(
  options: Partial<{
    stiffness: number;
    damping: number;
    bodyA: Matter.Body;
    bodyB: Matter.Body;
    pointA: Point;
    pointB: Point;
    length: number;
    label: string;
  }>
) {
  useType(PhysicsConstraint);

  const engine = useEngine();

  const constraint = Matter.Constraint.create(options);

  Matter.World.add(engine.world, constraint);

  useDestroy().onDestroy(() => {
    Matter.World.remove(engine.world, constraint, true);
  });

  return {
    constraint,
  };
}

function PhysicsMouseConstraint() {
  useType(PhysicsMouseConstraint);

  const engine = useEngine();
  const { canvas } = useContext();

  const constraint = Matter.MouseConstraint.create(engine, {
    mouse: Matter.Mouse.create(canvas),
    collisionFilter: {
      category: CollisionCategories.MOUSE_CONSTRAINT,
      mask: CollisionCategories.MOUSE_CONSTRAINT | CollisionCategories.DEFAULT,
    },
  });

  Matter.World.add(engine.world, constraint);
}

const Physics = {
  Engine: name("Physics.Engine", PhysicsEngine),
  Body: name("Physics.Body", PhysicsBody),
  Constraint: name("Physics.Constraint", PhysicsConstraint),
  MouseConstraint: name("Physics.MouseConstraint", PhysicsMouseConstraint),
  CollisionCategories,
};

export default Physics;
