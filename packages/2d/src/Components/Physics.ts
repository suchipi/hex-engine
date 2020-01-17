import { useType, useRootEntity, useDestroy } from "@hex-engine/core";
import Matter from "matter-js";
import { useUpdate } from "../Canvas";
import Geometry from "./Geometry";
import { Polygon, Circle } from "../Models";

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

  useUpdate((delta) => {
    Matter.Engine.update(engine, delta);
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
  { isStatic }: { isStatic?: boolean | undefined } = {}
) {
  useType(PhysicsBody);

  const engine = useEngine();

  let body: Matter.Body;
  if ((geometry.shape as Polygon).points) {
    const shape = geometry.shape as Polygon;

    body = Matter.Bodies.fromVertices(
      geometry.position.x,
      geometry.position.y,
      [shape.points.map((point) => Matter.Vector.create(point.x, point.y))],
      { isStatic }
    );
  } else if ((geometry.shape as Circle).radius != null) {
    const shape = geometry.shape as Circle;

    body = Matter.Bodies.circle(
      geometry.position.x,
      geometry.position.y,
      shape.radius,
      { isStatic }
    );
  } else {
    throw new Error("Unknown shape type; cannot construct physics body");
  }

  Matter.World.addBody(engine.world, body);

  useDestroy().onDestroy(() => {
    Matter.World.remove(engine.world, body, true);
  });

  if (isStatic) {
    useUpdate(() => {
      Matter.Body.setPosition(
        body,
        Matter.Vector.create(geometry.position.x, geometry.position.y)
      );
      Matter.Body.setAngle(body, geometry.rotation.radians);
    });
  } else {
    useUpdate(() => {
      geometry.position.mutateInto(body.position);
      geometry.rotation.radians = body.angle;
    });
  }
}

const Physics = {
  Engine: name("Physics.Engine", PhysicsEngine),
  Body: name("Physics.Body", PhysicsBody),
};

export default Physics;
