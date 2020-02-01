import {
  useType,
  useRootEntity,
  useDestroy,
  useEntity,
  Entity,
  useCallbackAsCurrent,
} from "@hex-engine/core";
import Matter from "matter-js";
import Geometry from "./Geometry";
import { Vector, Polygon, Circle } from "../Models";
import { useUpdate, useDraw, useDebugOverlayDrawTime } from "../Hooks";

// Matter needs this
// @ts-ignore
global.decomp = require("poly-decomp");

function name<T>(name: string, fn: T): T {
  Object.defineProperty(fn, "name", { value: name });
  return fn;
}

type CollisionListener = (other: {
  kind: "start" | "end";
  body: Matter.Body;
  entity: null | Entity;
}) => void;

/**
 * A Component that should be placed on the root Entity if you want to use physics in your game.
 *
 * Hex Engine's Physics are provided by [Matter.js](https://brm.io/matter-js/).
 */
function PhysicsEngine({
  debugDraw = false,
  gravity = new Vector(0, 1),
  enableSleeping = true,
}: {
  /**
   * Whether to render red wireframes of all physics bodies and constraints
   * into the canvas, for debugging purposes.
   */
  debugDraw?: boolean;

  /**
   * The gravity of the world, as a Vector.
   * An x or y value of 1 means "normal Earth gravity in this direction".
   */
  gravity?: Vector;

  /**
   * Whether to enable sleeping in the physics simulation.
   * This puts bodies that have not moved in a while to "sleep", and does
   * not update them until another body collides with them. This helps with framerate,
   * but at the expense of simulation accuracy.
   */
  enableSleeping?: boolean;
} = {}) {
  useType(PhysicsEngine);

  const engine = Matter.Engine.create(undefined, {
    enableSleeping,
  });
  engine.world.gravity.x = gravity.x;
  engine.world.gravity.y = gravity.y;

  const collisionListeners = new WeakMap<Entity, CollisionListener>();

  function addCollisionListener(callback: CollisionListener) {
    const entity = useEntity();
    collisionListeners.set(entity, useCallbackAsCurrent(callback));
  }

  let toProcess: Array<{ kind: "start" | "end"; pair: Matter.IPair }> = [];

  Matter.Events.on(engine, "collisionStart", (event) => {
    for (const pair of event.pairs) {
      toProcess.push({ kind: "start", pair });
    }
  });

  Matter.Events.on(engine, "collisionEnd", (event) => {
    for (const pair of event.pairs) {
      toProcess.push({ kind: "end", pair });
    }
  });

  useUpdate(() => {
    for (const { kind, pair } of toProcess) {
      const { bodyA, bodyB } = pair;
      // @ts-ignore
      const entA: Entity | undefined = bodyA.entity;
      // @ts-ignore
      const entB: Entity | undefined = bodyB.entity;

      if (entA && collisionListeners.has(entA)) {
        const listener = collisionListeners.get(entA);
        if (listener) {
          listener({ kind, body: bodyB, entity: entB || null });
        }
      }
      if (entB && collisionListeners.has(entB)) {
        const listener = collisionListeners.get(entB);
        if (listener) {
          listener({ kind, body: bodyA, entity: entA || null });
        }
      }
    }
    toProcess = [];
  });

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

  const state = {
    /** The Matter.js Engine object. */
    engine,

    /**
     * Adds a collision listener for the current Entity.
     *
     * It will be called when another Entity's Physics.Body starts and stops colliding with this Entity's.
     */
    addCollisionListener,

    /**
     * Whether to render red wireframes of all physics bodies and constraints
     * into the canvas, for debugging purposes.
     */
    debugDraw,
  };

  function drawComposite(
    context: CanvasRenderingContext2D,
    composite: Matter.Composite
  ) {
    composite.bodies.forEach(drawBody.bind(null, context));
    composite.constraints.forEach(drawConstraint.bind(null, context));
    composite.composites.forEach(drawComposite.bind(null, context));
  }

  function drawBody(context: CanvasRenderingContext2D, body: Matter.Body) {
    context.beginPath();
    body.vertices.forEach((vert, index) => {
      if (index === 0) {
        context.moveTo(vert.x, vert.y);
      } else {
        context.lineTo(vert.x, vert.y);
      }
    });
    context.closePath();
    context.stroke();
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
    context.beginPath();
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

/** Get the Physics Engine from the root Entity. If it is not present, throw an Error. */
function useEngine() {
  const engine = useRootEntity().getComponent(PhysicsEngine)?.engine;
  if (!engine) {
    throw new Error(
      "Attempted to get Physics.Engine component from the root entity, but there wasn't one there."
    );
  }
  return engine;
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

/**
 * A Component that should be added to any Entity that will participate in the physics simulation.
 *
 * Hex Engine's Physics are provided by [Matter.js](https://brm.io/matter-js/).
 */
function PhysicsBody(
  geometry: ReturnType<typeof Geometry>,
  {
    label = useEntity().name || undefined,
    ...otherOpts
  }: Partial<{
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
  }> = {}
) {
  useType(PhysicsBody);

  const engine = useEngine();
  const addCollisionListener = useCollisionListener();

  const opts = {
    angle: geometry.rotation,
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

  let lastPoints = (geometry.shape as Polygon).points;
  let lastRadius = (geometry.shape as Circle).radius;
  useUpdate(() => {
    if ((geometry.shape as Polygon).points !== lastPoints) {
      const shape = geometry.shape as Polygon;

      const worldPos = geometry.worldPosition();

      const nextBody = Matter.Bodies.fromVertices(
        worldPos.x,
        worldPos.y,
        [shape.points],
        {
          ...opts,
          angle: geometry.rotation,
        }
      );
      if (nextBody) {
        Matter.Body.setVertices(body, nextBody.vertices);
      }
    } else if ((geometry.shape as Circle).radius != lastRadius) {
      const shape = geometry.shape as Circle;

      const worldPos = geometry.worldPosition();

      const nextBody = Matter.Bodies.circle(
        worldPos.x,
        worldPos.y,
        shape.radius,
        opts
      );

      if (nextBody) {
        Matter.Body.setVertices(body, nextBody.vertices);
      }
    }

    if (body.isStatic) {
      Matter.Body.setPosition(body, geometry.position);
      Matter.Body.setAngle(body, geometry.rotation);
    } else {
      geometry.position.mutateInto(body.position);
      geometry.rotation = body.angle;
    }

    lastPoints = (geometry.shape as Polygon).points;
    lastRadius = (geometry.shape as Circle).radius;
  });

  return {
    get body() {
      return body;
    },
    applyForce(position: Vector, force: Vector) {
      Matter.Body.applyForce(body, position, force);
    },
    setAngle(angle: number) {
      Matter.Body.setAngle(body, angle);
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
    setPosition(position: Vector) {
      Matter.Body.setPosition(body, position);
    },
    setStatic(isStatic: boolean) {
      Matter.Body.setStatic(body, isStatic);
    },
    setVelocity(velocity: Vector) {
      Matter.Body.setVelocity(body, velocity);
    },
    onCollision: addCollisionListener,
  };
}

/**
 * A Component that can be used to bind two physics bodies together with a rope,
 * spring, nail, or other real or imaginary constraint.
 *
 * Hex Engine's Physics are provided by [Matter.js](https://brm.io/matter-js/).
 */
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
    pointA: Vector;

    /**
     * The position where the constraint is attached to `bodyB`, or a world-space position
     * that the constraint is attached to if `bodyB` is not defined..
     *
     * For more information, check the [Matter.js Documentation](https://brm.io/matter-js/docs/classes/Constraint.html)
     */
    pointB: Vector;

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

/**
 * An assortment of Components that you can use to add simulated 2D physics to your game.
 */
const Physics = {
  /**
   * A Component that should be placed on the root Entity if you want to use physics in your game.
   *
   * Hex Engine's Physics are provided by [Matter.js](https://brm.io/matter-js/).
   */
  Engine: name("Physics.Engine", PhysicsEngine),

  /**
   * A Component that should be added to any Entity that will participate in the physics simulation.
   *
   * Hex Engine's Physics are provided by [Matter.js](https://brm.io/matter-js/).
   */
  Body: name("Physics.Body", PhysicsBody),

  /**
   * A Component that connects two Physics.Body Components together using a rope, spring, nail, etc.
   *
   * Hex Engine's Physics are provided by [Matter.js](https://brm.io/matter-js/).
   */
  Constraint: name("Physics.Constraint", PhysicsConstraint),
};

export default Physics;
