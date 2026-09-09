/// <reference types="@test-it/core/globals" />
import {
  Entity,
  useCallbackAsCurrent,
  useChild,
  useEntity,
  useNewComponent,
  useType,
} from "@hex-engine/core";
import { Circle, Polygon, Vector } from "../Models";
import Geometry from "./Geometry";
import Mouse from "./Mouse";
import {
  endGame,
  mouseDown,
  mouseMove,
  mouseOut,
  mouseUp,
  startGame,
  step,
  touchEnd,
  touchStart,
  xy,
} from "./inputTestSetup";

type MouseApi = ReturnType<typeof Mouse>;

afterEach(endGame);

/** A 40x40 box at `position` with a Mouse on it, whose callbacks append to `calls`. */
function Box({
  position,
  calls,
  rotation = 0,
  scale = new Vector(1, 1),
  origin = new Vector(0, 0),
  shape = Polygon.rectangle(40, 40),
  name = "box",
}: {
  position: Vector;
  calls: Array<string>;
  rotation?: number;
  scale?: Vector;
  origin?: Vector;
  shape?: Polygon | Circle;
  name?: string;
}) {
  useType(Box);

  useNewComponent(() => Geometry({ shape, position, rotation, scale, origin }));

  const mouse = useNewComponent(Mouse);
  mouse.onEnter(() => calls.push(`${name} enter`));
  mouse.onLeave(() => calls.push(`${name} leave`));
  mouse.onMove(() => calls.push(`${name} move`));
  mouse.onDown(() => calls.push(`${name} down`));
  mouse.onUp(() => calls.push(`${name} up`));
  mouse.onClick(() => calls.push(`${name} click`));
  mouse.onRightClick(() => calls.push(`${name} rightClick`));
  mouse.onMiddleClick(() => calls.push(`${name} middleClick`));

  return mouse;
}

function startWithOneBox(options: Omit<Parameters<typeof Box>[0], "calls">): {
  mouse: MouseApi;
  calls: Array<string>;
} {
  const calls: Array<string> = [];
  let mouse!: MouseApi;

  startGame(() => {
    useChild(() => {
      mouse = Box({ ...options, calls });
    });
  });

  return { mouse, calls };
}

test("position starts at infinity and then tracks the cursor in Entity space", () => {
  const { mouse } = startWithOneBox({ position: new Vector(100, 50) });

  expect(xy(mouse.position)).toEqual({ x: Infinity, y: Infinity });

  mouseMove(110, 60);
  step();
  expect(xy(mouse.position)).toEqual({ x: 10, y: 10 });

  mouseMove(300, 300);
  step();
  expect(xy(mouse.position)).toEqual({ x: 200, y: 250 });
});

test("isInsideBounds follows the Geometry's shape", () => {
  const { mouse } = startWithOneBox({ position: new Vector(100, 100) });

  const insideAt = (x: number, y: number) => {
    mouseMove(x, y);
    step();
    return mouse.isInsideBounds;
  };

  expect(insideAt(100, 100)).toBe(true);
  expect(insideAt(119, 119)).toBe(true);
  expect(insideAt(81, 81)).toBe(true);
  expect(insideAt(121, 100)).toBe(false);
  expect(insideAt(100, 121)).toBe(false);
});

test("isInsideBounds uses a Circle shape when the Geometry has one", () => {
  const { mouse } = startWithOneBox({
    position: new Vector(100, 100),
    shape: new Circle(20),
  });

  const insideAt = (x: number, y: number) => {
    mouseMove(x, y);
    step();
    return mouse.isInsideBounds;
  };

  expect(insideAt(119, 100)).toBe(true);
  expect(insideAt(121, 100)).toBe(false);
  // Inside the bounding box's corner, but outside the circle.
  expect(insideAt(118, 118)).toBe(false);
});

test("onEnter and onLeave are edge-triggered, while onMove is not", () => {
  const { calls } = startWithOneBox({ position: new Vector(100, 100) });

  mouseMove(300, 300);
  step();
  expect(calls).toEqual(["box move"]);

  mouseMove(100, 100);
  step();
  expect(calls).toEqual(["box move", "box move", "box enter"]);

  mouseMove(110, 110);
  step();
  expect(calls).toEqual(["box move", "box move", "box enter", "box move"]);

  mouseMove(300, 300);
  step();
  expect(calls).toEqual([
    "box move",
    "box move",
    "box enter",
    "box move",
    "box move",
    "box leave",
  ]);
});

test("isInsideBounds is already up to date inside onEnter and onLeave", () => {
  const seen: Array<string> = [];
  let mouse!: MouseApi;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(40, 40),
          position: new Vector(100, 100),
        })
      );

      mouse = useNewComponent(Mouse);
      mouse.onEnter(() => seen.push(`enter ${mouse.isInsideBounds}`));
      mouse.onLeave(() => seen.push(`leave ${mouse.isInsideBounds}`));
    });
  });

  mouseMove(100, 100);
  step();
  mouseMove(300, 300);
  step();

  expect(seen).toEqual(["enter true", "leave false"]);
});

test("the cursor leaving the canvas does not count as leaving the Entity", () => {
  const { mouse, calls } = startWithOneBox({ position: new Vector(100, 100) });

  mouseMove(100, 100);
  step();
  expect(mouse.isInsideBounds).toBe(true);

  mouseOut(500, 500);
  step();
  expect(mouse.isInsideBounds).toBe(true);
  expect(calls).toEqual(["box move", "box enter"]);
});

test("only the topmost Entity at a point is inside bounds", () => {
  const calls: Array<string> = [];
  let lower!: MouseApi;
  let upper!: MouseApi;

  startGame(() => {
    useChild(() => {
      lower = Box({
        position: new Vector(200, 200),
        shape: Polygon.rectangle(100, 100),
        name: "lower",
        calls,
      });
    });
    useChild(() => {
      upper = Box({
        position: new Vector(200, 200),
        shape: Polygon.rectangle(50, 50),
        name: "upper",
        calls,
      });
    });
  });

  mouseMove(200, 200);
  step();
  expect({ lower: lower.isInsideBounds, upper: upper.isInsideBounds }).toEqual({
    lower: false,
    upper: true,
  });

  // Outside the upper box, but still within the lower one.
  mouseMove(240, 200);
  step();
  expect({ lower: lower.isInsideBounds, upper: upper.isInsideBounds }).toEqual({
    lower: true,
    upper: false,
  });

  expect(calls.filter((call) => !call.endsWith("move"))).toEqual([
    "upper enter",
    "lower enter",
    "upper leave",
  ]);
});

test("hit testing accounts for ancestor Entities' transforms", () => {
  let kid!: MouseApi;
  const calls: Array<string> = [];

  startGame(() => {
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

    parent.rootComponent.addChild(() => {
      kid = Box({ position: new Vector(30, 20), name: "kid", calls });
    });
  });

  mouseMove(130, 120);
  step();
  expect(xy(kid.position)).toEqual({ x: 0, y: 0 });
  expect(kid.isInsideBounds).toBe(true);

  mouseMove(151, 120);
  step();
  expect(xy(kid.position)).toEqual({ x: 21, y: 0 });
  expect(kid.isInsideBounds).toBe(false);
});

test("origin shifts the hit box to where the Entity draws", () => {
  const { mouse } = startWithOneBox({
    position: new Vector(100, 100),
    origin: new Vector(5, 7),
  });

  const insideAt = (x: number, y: number) => {
    mouseMove(x, y);
    step();
    return mouse.isInsideBounds;
  };

  // origin moves the shape by -origin, so the box is centered on (95, 93).
  expect(insideAt(95, 93)).toBe(true);
  expect(insideAt(114, 93)).toBe(true);
  expect(insideAt(116, 93)).toBe(false);
  expect(insideAt(76, 93)).toBe(true);
  expect(insideAt(74, 93)).toBe(false);
  expect(insideAt(95, 112)).toBe(true);
  expect(insideAt(95, 114)).toBe(false);
});

test("onDown fires only for the left button, and only inside bounds", () => {
  const { calls } = startWithOneBox({ position: new Vector(100, 100) });

  mouseMove(100, 100);
  step();

  mouseDown(100, 100, 2);
  step();
  mouseDown(100, 100, 1);
  step();
  expect(calls.filter((call) => call === "box down")).toEqual([]);

  mouseDown(100, 100, 0);
  step();
  expect(calls.filter((call) => call === "box down")).toEqual(["box down"]);

  mouseUp(100, 100, 0);
  step();
  mouseMove(300, 300);
  step();
  mouseDown(300, 300, 0);
  step();
  expect(calls.filter((call) => call === "box down")).toEqual(["box down"]);
});

test("onUp fires for the left button even when the cursor is outside bounds", () => {
  const { mouse, calls } = startWithOneBox({ position: new Vector(100, 100) });

  mouseMove(300, 300);
  step();
  expect(mouse.isInsideBounds).toBe(false);

  mouseUp(300, 300, 0);
  step();
  expect(calls.filter((call) => call === "box up")).toEqual(["box up"]);

  mouseUp(300, 300, 2);
  step();
  expect(calls.filter((call) => call === "box up")).toEqual(["box up"]);
});

test("onClick requires a press and a release that are both inside bounds", () => {
  const { calls } = startWithOneBox({ position: new Vector(100, 100) });

  mouseMove(100, 100);
  step();
  mouseDown(100, 100, 0);
  step();
  mouseUp(100, 100, 0);
  step();

  expect(calls.filter((call) => call.match(/down|up|click/))).toEqual([
    "box down",
    "box click",
    "box up",
  ]);
});

test("pressing inside and releasing outside is not a click", () => {
  const { calls } = startWithOneBox({ position: new Vector(100, 100) });

  mouseMove(100, 100);
  step();
  mouseDown(100, 100, 0);
  step();
  mouseMove(300, 300, 1);
  step();
  mouseUp(300, 300, 0);
  step();

  expect(calls.filter((call) => call.match(/down|up|click/))).toEqual([
    "box down",
    "box up",
  ]);
});

test("releasing inside without having pressed first is not a click", () => {
  const { calls } = startWithOneBox({ position: new Vector(100, 100) });

  mouseMove(100, 100);
  step();
  mouseUp(100, 100, 0);
  step();

  expect(calls.filter((call) => call.match(/down|up|click/))).toEqual([
    "box up",
  ]);
});

test("onRightClick and onMiddleClick fire for their own buttons", () => {
  const { calls } = startWithOneBox({ position: new Vector(100, 100) });

  mouseMove(100, 100);
  step();

  mouseDown(100, 100, 2);
  step();
  mouseUp(100, 100, 2);
  step();

  mouseDown(100, 100, 1);
  step();
  mouseUp(100, 100, 1);
  step();

  expect(calls.filter((call) => call.includes("Click"))).toEqual([
    "box rightClick",
    "box middleClick",
  ]);
});

test("isPressing flags track each button separately", () => {
  const { mouse } = startWithOneBox({ position: new Vector(100, 100) });

  const pressing = () => ({
    left: mouse.isPressingLeft,
    right: mouse.isPressingRight,
    middle: mouse.isPressingMiddle,
  });

  mouseMove(100, 100);
  step();
  expect(pressing()).toEqual({ left: false, right: false, middle: false });

  mouseDown(100, 100, 0);
  step();
  expect(pressing()).toEqual({ left: true, right: false, middle: false });

  mouseDown(100, 100, 2);
  step();
  expect(pressing()).toEqual({ left: true, right: true, middle: false });

  mouseUp(100, 100, 0);
  step();
  expect(pressing()).toEqual({ left: false, right: true, middle: false });

  mouseUp(100, 100, 2);
  step();
  expect(pressing()).toEqual({ left: false, right: false, middle: false });
});

test("a press is handled after the move that entered the bounds in the same frame", () => {
  const { calls } = startWithOneBox({ position: new Vector(100, 100) });

  mouseMove(100, 100);
  mouseDown(100, 100, 0);
  step();
  expect(calls).toEqual(["box move", "box enter", "box down"]);

  mouseUp(100, 100, 0);
  step();
  expect(calls).toEqual([
    "box move",
    "box enter",
    "box down",
    "box click",
    "box up",
  ]);
});

test("a tap presses and clicks the Entity it landed on", () => {
  const { calls } = startWithOneBox({ position: new Vector(100, 100) });

  touchStart(100, 100);
  step();
  expect(calls).toEqual(["box move", "box enter", "box down"]);

  touchEnd(100, 100);
  step();
  expect(calls).toEqual([
    "box move",
    "box enter",
    "box down",
    "box click",
    "box up",
  ]);
});

test("bounds follow the Entity when it moves under a stationary cursor", () => {
  const calls: Array<string> = [];
  let mouse!: MouseApi;
  let geometry!: ReturnType<typeof Geometry>;

  startGame(() => {
    useChild(function Mover() {
      useType(Mover);

      geometry = useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(40, 40),
          position: new Vector(100, 100),
        })
      );

      mouse = useNewComponent(Mouse);
      mouse.onEnter(() => calls.push("enter"));
      mouse.onLeave(() => calls.push("leave"));
      mouse.onMove(() => calls.push("move"));
    });
  });

  mouseMove(200, 100);
  step();
  expect(mouse.isInsideBounds).toBe(false);
  expect(xy(mouse.position)).toEqual({ x: 100, y: 0 });

  geometry.position.mutateInto(new Vector(200, 100));
  step();
  expect(mouse.isInsideBounds).toBe(true);
  expect(xy(mouse.position)).toEqual({ x: 0, y: 0 });

  geometry.position.mutateInto(new Vector(100, 100));
  step();
  expect(mouse.isInsideBounds).toBe(false);
  expect(xy(mouse.position)).toEqual({ x: 100, y: 0 });

  expect(calls).toEqual(["move", "enter", "leave"]);
});

test("a Mouse with no Geometry tracks position but is never inside bounds", () => {
  const calls: Array<string> = [];
  let mouse!: MouseApi;

  startGame(() => {
    useChild(function NoGeometry() {
      useType(NoGeometry);

      mouse = useNewComponent(Mouse);
      mouse.onMove(() => calls.push("move"));
      mouse.onEnter(() => calls.push("enter"));
      mouse.onDown(() => calls.push("down"));
    });
  });

  mouseMove(100, 50);
  step();
  mouseDown(100, 50, 0);
  step();

  expect(xy(mouse.position)).toEqual({ x: 100, y: 50 });
  expect(mouse.isInsideBounds).toBe(false);
  expect(calls).toEqual(["move"]);
});

test("a Mouse can be given the Entity and Geometry to use explicitly", () => {
  let mouse!: MouseApi;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      const geometry = useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(40, 40),
          position: new Vector(100, 100),
        })
      );
      mouse = useNewComponent(() => Mouse({ entity: useEntity(), geometry }));
    });
  });

  mouseMove(100, 100);
  step();
  expect(mouse.isInsideBounds).toBe(true);

  mouseMove(200, 100);
  step();
  expect(mouse.isInsideBounds).toBe(false);
});

test("a destroyed Entity's Mouse stops receiving events", () => {
  const calls: Array<string> = [];
  let entity!: Entity;

  startGame(() => {
    entity = useChild(() => {
      Box({ position: new Vector(100, 100), calls });
    });
  });

  mouseMove(100, 100);
  step();
  expect(calls).toEqual(["box move", "box enter"]);

  entity.destroy();
  mouseMove(110, 110);
  step();
  expect(calls).toEqual(["box move", "box enter"]);
});

test("hit testing accounts for scale", () => {
  const { mouse } = startWithOneBox({
    position: new Vector(200, 200),
    scale: new Vector(2, 2),
  });

  const insideAt = (x: number, y: number) => {
    mouseMove(x, y);
    step();
    return mouse.isInsideBounds;
  };

  // Doubling a 40x40 box centered on (200, 200) spans 160 to 240.
  expect(insideAt(200, 200)).toBe(true);
  expect(insideAt(239, 200)).toBe(true);
  expect(insideAt(241, 200)).toBe(false);
  expect(insideAt(200, 239)).toBe(true);
  expect(insideAt(200, 241)).toBe(false);
});

test("hit testing accounts for rotation", () => {
  const { mouse } = startWithOneBox({
    position: new Vector(200, 200),
    shape: Polygon.rectangle(40, 10),
    rotation: Math.PI / 2,
  });

  const insideAt = (x: number, y: number) => {
    mouseMove(x, y);
    step();
    return mouse.isInsideBounds;
  };

  // A quarter turn puts the bar's long axis on y: x 195 to 205, y 180 to 220.
  expect(insideAt(200, 215)).toBe(true);
  expect(insideAt(200, 225)).toBe(false);
  expect(insideAt(215, 200)).toBe(false);
  expect(insideAt(203, 200)).toBe(true);
});

test("one Entity's bounds check does not affect another's in the same frame", () => {
  const insideAtWith = (extraBoxes: boolean) => {
    const calls: Array<string> = [];
    let scaled!: MouseApi;

    startGame(() => {
      if (extraBoxes) {
        useChild(() => {
          Box({ position: new Vector(100, 100), name: "plain", calls });
        });
      }
      useChild(() => {
        scaled = Box({
          position: new Vector(300, 100),
          scale: new Vector(2, 2),
          name: "scaled",
          calls,
        });
      });
    });

    mouseMove(330, 100);
    step();
    const result = scaled.isInsideBounds;
    endGame();
    return result;
  };

  expect(insideAtWith(false)).toBe(true);
  expect(insideAtWith(true)).toBe(true);
});
