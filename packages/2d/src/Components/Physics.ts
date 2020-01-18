import { useType, useRootEntity, useDestroy } from "@hex-engine/core";
import Matter from "matter-js";
import { useUpdate } from "../Canvas";
import Geometry from "./Geometry";
import { Angle, Point, Polygon, Circle } from "../Models";
import { useContext } from "../Hooks";

// Matter needs this
// @ts-ignore
global.decomp = require("poly-decomp");

function name<T>(name: string, fn: T): T {
  Object.defineProperty(fn, "name", { value: name });
  return fn;
}

function PhysicsEngine() {
  useType(PhysicsEngine);

  const engine = Matter.Engine.create();

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

  return { engine };
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

function PhysicsBody(
  geometry: ReturnType<typeof Geometry>,
  {
    respondsToMouseConstraint = false,
    ...otherOpts
  }: Partial<{
    respondsToMouseConstraint: boolean;
    isStatic: boolean;
    density: number;
    friction: number;
    frictionAir: number;
    isSensor: boolean;
    restitution: number;
    timeScale: number;
    frictionStatic: number;
  }> = {}
) {
  useType(PhysicsBody);

  const engine = useEngine();

  const opts = {
    collisionFilter: {
      category: respondsToMouseConstraint ? 3 : 1,
      mask: respondsToMouseConstraint ? 3 : 1,
    },
    angle: geometry.rotation.radians,
    ...otherOpts,
  };

  let body: Matter.Body;
  if ((geometry.shape as Polygon).points) {
    const shape = geometry.shape as Polygon;

    body = Matter.Bodies.fromVertices(
      geometry.position.x,
      geometry.position.y,
      [shape.points],
      opts
    );
  } else if ((geometry.shape as Circle).radius != null) {
    const shape = geometry.shape as Circle;

    body = Matter.Bodies.circle(
      geometry.position.x,
      geometry.position.y,
      shape.radius,
      opts
    );
  } else {
    throw new Error("Unknown shape type; cannot construct physics body");
  }

  Matter.World.addBody(engine.world, body);

  useDestroy().onDestroy(() => {
    Matter.World.remove(engine.world, body, true);
  });

  if (opts.isStatic) {
    useUpdate(() => {
      Matter.Body.setPosition(body, geometry.position);
      Matter.Body.setAngle(body, geometry.rotation.radians);
    });
  } else {
    useUpdate(() => {
      geometry.position.mutateInto(body.position);
      geometry.rotation.radians = body.angle;
    });
  }

  return {
    body,
    applyForce(position: Point, force: Point) {
      Matter.Body.applyForce(body, position, force);
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
  }>
) {
  useType(PhysicsConstraint);

  const engine = useEngine();

  const constraint = Matter.Constraint.create(options);

  Matter.World.add(engine.world, constraint);

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
      category: 2,
      mask: 2,
    },
  });
  Matter.World.add(engine.world, constraint);
}

const Physics = {
  Engine: name("Physics.Engine", PhysicsEngine),
  Body: name("Physics.Body", PhysicsBody),
  Constraint: name("Physics.Constraint", PhysicsConstraint),
  MouseConstraint: name("Physics.MouseConstraint", PhysicsMouseConstraint),
};

export default Physics;
