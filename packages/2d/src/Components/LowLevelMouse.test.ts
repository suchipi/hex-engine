/// <reference types="@test-it/core/globals" />
import {
  Component,
  Entity,
  useCallbackAsCurrent,
  useChild,
  useNewComponent,
  useType,
} from "@hex-engine/core";
import { Polygon, Vector } from "../Models";
import { useRawDraw } from "../Canvas";
import Geometry from "./Geometry";
import LowLevelMouse, { HexMouseEvent } from "./LowLevelMouse";
import {
  CANVAS_SIZE,
  canvasBoundingRect,
  endGame,
  mouseDown,
  mouseMove,
  mouseOut,
  mouseOver,
  mouseUp,
  startGame,
  step,
  touchEnd,
  touchMove,
  touchStart,
  xy,
} from "./inputTestSetup";

afterEach(endGame);

test("harness: the canvas sits at the page origin and is not scaled", () => {
  startGame(() => {});

  const rect = canvasBoundingRect();
  expect({
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  }).toEqual({
    left: 0,
    top: 0,
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
  });
});

test("events are delivered during the next frame, not synchronously", () => {
  const calls: Array<string> = [];

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      const mouse = useNewComponent(() =>
        LowLevelMouse({ positionsRelativeTo: "screen" })
      );
      mouse.onMouseMove(() => calls.push("move"));
      mouse.onMouseDown(() => calls.push("down"));
      mouse.onMouseUp(() => calls.push("up"));
    });
  });

  mouseMove(10, 10);
  mouseDown(10, 10);
  mouseUp(10, 10);
  expect(calls).toEqual([]);

  step();
  expect(calls).toEqual(["move", "down", "up"]);

  step();
  expect(calls).toEqual(["move", "down", "up"]);
});

test("positions default to being relative to the owning Entity", () => {
  let seen: null | { x: number; y: number } = null;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(40, 40),
          position: new Vector(100, 50),
        })
      );
      useNewComponent(LowLevelMouse).onMouseMove((event) => {
        seen = xy(event.pos);
      });
    });
  });

  mouseMove(110, 60);
  step();

  expect(seen).toEqual({ x: 10, y: 10 });
});

test("positionsRelativeTo selects the coordinate space of event.pos", () => {
  const seen: { [key: string]: { x: number; y: number } } = {};

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(40, 40),
          position: new Vector(100, 50),
        })
      );

      const record = (key: string) => (event: HexMouseEvent) => {
        seen[key] = xy(event.pos);
      };

      useNewComponent(() =>
        LowLevelMouse({ positionsRelativeTo: "owning-entity" })
      ).onMouseMove(record("owning-entity"));
      useNewComponent(() =>
        LowLevelMouse({ positionsRelativeTo: "world" })
      ).onMouseMove(record("world"));
      useNewComponent(() =>
        LowLevelMouse({ positionsRelativeTo: "screen" })
      ).onMouseMove(record("screen"));
    });
  });

  mouseMove(110, 60);
  step();

  expect(seen).toEqual({
    "owning-entity": { x: 10, y: 10 },
    world: { x: 110, y: 60 },
    screen: { x: 110, y: 60 },
  });
});

test("Entity-relative positions account for ancestor Entities' transforms", () => {
  let seen: null | { x: number; y: number } = null;

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

    parent.rootComponent.addChild(function Kid() {
      useType(Kid);

      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(40, 40),
          position: new Vector(30, 20),
        })
      );
      useNewComponent(LowLevelMouse).onMouseMove((event) => {
        seen = xy(event.pos);
      });
    });
  });

  mouseMove(145, 135);
  step();

  expect(seen).toEqual({ x: 15, y: 15 });
});

test("Entity-relative positions account for rotation, scale, and origin", () => {
  const seen: { [key: string]: { x: number; y: number } } = {};

  startGame(() => {
    const record = (key: string) => (event: HexMouseEvent) => {
      seen[key] = xy(event.pos);
    };

    useChild(function Rotated() {
      useType(Rotated);

      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(40, 40),
          position: new Vector(100, 100),
          rotation: Math.PI / 2,
        })
      );
      useNewComponent(LowLevelMouse).onMouseMove(record("rotated"));
    });

    useChild(function Scaled() {
      useType(Scaled);

      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(40, 40),
          position: new Vector(100, 100),
          scale: new Vector(2, 4),
        })
      );
      useNewComponent(LowLevelMouse).onMouseMove(record("scaled"));
    });

    useChild(function Origined() {
      useType(Origined);

      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(40, 40),
          position: new Vector(100, 100),
          origin: new Vector(5, 7),
        })
      );
      useNewComponent(LowLevelMouse).onMouseMove(record("origined"));
    });
  });

  mouseMove(120, 108);
  step();

  expect(seen.rotated.x).toBeCloseTo(8, 10);
  expect(seen.rotated.y).toBeCloseTo(-20, 10);
  expect(seen.scaled).toEqual({ x: 10, y: 2 });
  expect(seen.origined).toEqual({ x: 25, y: 15 });
});

test("positions account for the canvas being displayed at a different size than its backing store", () => {
  let seen: null | { x: number; y: number } = null;

  startGame(
    () => {
      useChild(function Subject() {
        useType(Subject);

        useNewComponent(() =>
          LowLevelMouse({ positionsRelativeTo: "screen" })
        ).onMouseMove((event) => {
          seen = xy(event.pos);
        });
      });
    },
    { canvasSize: 100, cssSize: 200 }
  );

  mouseMove(100, 60);
  step();

  expect(seen).toEqual({ x: 50, y: 30 });
});

test("world positions undo whatever transform the canvas context was left in", () => {
  const seen: { [key: string]: { x: number; y: number } } = {};

  startGame(() => {
    useChild(function Camera() {
      useType(Camera);

      useRawDraw((context) => {
        context.translate(-50, -25);
      });
    });

    useChild(function Subject() {
      useType(Subject);

      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(40, 40),
          position: new Vector(100, 100),
        })
      );

      const record = (key: string) => (event: HexMouseEvent) => {
        seen[key] = xy(event.pos);
      };

      useNewComponent(() =>
        LowLevelMouse({ positionsRelativeTo: "screen" })
      ).onMouseMove(record("screen"));
      useNewComponent(() =>
        LowLevelMouse({ positionsRelativeTo: "world" })
      ).onMouseMove(record("world"));
      useNewComponent(LowLevelMouse).onMouseMove(record("owning-entity"));
    });
  });

  mouseMove(60, 80);
  step();

  expect(seen).toEqual({
    screen: { x: 60, y: 80 },
    world: { x: 60, y: 80 },
    "owning-entity": { x: -40, y: -20 },
  });

  mouseMove(60, 80);
  step();

  expect(seen).toEqual({
    screen: { x: 60, y: 80 },
    world: { x: 110, y: 105 },
    "owning-entity": { x: 10, y: 5 },
  });
});

test("delta is measured from the previous event of the same type", () => {
  const calls: Array<string> = [];

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      const mouse = useNewComponent(() =>
        LowLevelMouse({ positionsRelativeTo: "screen" })
      );
      const record = (name: string) => (event: HexMouseEvent) => {
        const delta = xy(event.delta);
        calls.push(`${name} ${delta.x},${delta.y}`);
      };
      mouse.onMouseMove(record("move"));
      mouse.onMouseDown(record("down"));
    });
  });

  mouseMove(10, 20);
  step();
  mouseMove(30, 45);
  step();
  mouseDown(35, 45);
  step();
  mouseMove(40, 45);
  step();
  mouseDown(50, 45);
  step();

  expect(calls).toEqual([
    "move 10,20",
    "move 20,25",
    "down 35,45",
    // Measured from the move at (30, 45), not from the down at (35, 45).
    "move 10,0",
    "down 15,0",
  ]);
});

test("each LowLevelMouse Component tracks its own deltas", () => {
  const calls: Array<string> = [];

  const root = startGame(() => {
    useChild(function First() {
      useType(First);

      useNewComponent(() =>
        LowLevelMouse({ positionsRelativeTo: "screen" })
      ).onMouseMove((event) => calls.push(`first ${xy(event.delta).x}`));
    });
  });

  mouseMove(50, 0);
  step();

  root.createChild(function Second() {
    useType(Second);

    useNewComponent(() =>
      LowLevelMouse({ positionsRelativeTo: "screen" })
    ).onMouseMove((event) => calls.push(`second ${xy(event.delta).x}`));
  });

  mouseMove(70, 0);
  step();

  expect(calls).toEqual(["first 50", "first 20", "second 70"]);
});

test("every event from a frame is delivered, in the order the browser produced them", () => {
  const calls: Array<string> = [];

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      const mouse = useNewComponent(() =>
        LowLevelMouse({ positionsRelativeTo: "screen" })
      );
      mouse.onMouseMove((event) => calls.push(`move ${xy(event.pos).x}`));
      mouse.onMouseDown((event) => calls.push(`down ${xy(event.pos).x}`));
      mouse.onMouseUp((event) => calls.push(`up ${xy(event.pos).x}`));
    });
  });

  mouseMove(10, 0);
  mouseMove(20, 0);
  mouseMove(30, 0);
  mouseDown(31, 0);
  mouseUp(32, 0);
  mouseDown(33, 0);
  mouseUp(34, 0);
  step();

  expect(calls).toEqual([
    "move 10",
    "move 20",
    "move 30",
    "down 31",
    "up 32",
    "down 33",
    "up 34",
  ]);
});

test("events within a frame are not reordered", () => {
  const calls: Array<string> = [];

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      const mouse = useNewComponent(() =>
        LowLevelMouse({ positionsRelativeTo: "screen" })
      );
      mouse.onMouseUp(() => calls.push("up"));
      mouse.onMouseDown(() => calls.push("down"));
      mouse.onCanvasLeave(() => calls.push("canvasLeave"));
      mouse.onCanvasEnter(() => calls.push("canvasEnter"));
      mouse.onMouseMove(() => calls.push("move"));
    });
  });

  mouseUp(1, 1);
  mouseDown(2, 2);
  mouseOut(3, 3);
  mouseOver(4, 4);
  mouseMove(5, 5);
  step();

  expect(calls).toEqual(["up", "down", "canvasLeave", "canvasEnter", "move"]);
});

test("mouseover and mouseout drive onCanvasEnter and onCanvasLeave", () => {
  const calls: Array<string> = [];

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      const mouse = useNewComponent(() =>
        LowLevelMouse({ positionsRelativeTo: "screen" })
      );
      mouse.onCanvasEnter((event) => calls.push(`enter ${xy(event.pos).x}`));
      mouse.onCanvasLeave((event) => calls.push(`leave ${xy(event.pos).x}`));
    });
  });

  mouseOver(11, 0);
  step();
  mouseOut(22, 0);
  step();

  expect(calls).toEqual(["enter 11", "leave 22"]);
});

test("move events read buttons from the bitmask", () => {
  const calls: Array<HexMouseEvent["buttons"]> = [];

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      useNewComponent(LowLevelMouse).onMouseMove((event) => {
        calls.push({ ...event.buttons });
      });
    });
  });

  mouseMove(10, 10, 0);
  step();
  mouseMove(10, 10, 1 | 4);
  step();
  mouseMove(10, 10, 2 | 8 | 16);
  step();

  expect(calls).toEqual([
    {
      left: false,
      right: false,
      middle: false,
      mouse4: false,
      mouse5: false,
    },
    {
      left: true,
      right: false,
      middle: true,
      mouse4: false,
      mouse5: false,
    },
    {
      left: false,
      right: true,
      middle: false,
      mouse4: true,
      mouse5: true,
    },
  ]);
});

test("down and up events read a single button from the button index", () => {
  const calls: Array<HexMouseEvent["buttons"]> = [];

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      const mouse = useNewComponent(LowLevelMouse);
      const record = (event: HexMouseEvent) => {
        calls.push({ ...event.buttons });
      };
      mouse.onMouseDown(record);
      mouse.onMouseUp(record);
    });
  });

  for (const button of [0, 1, 2, 3, 4]) {
    mouseDown(10, 10, button);
    step();
  }
  mouseUp(10, 10, 2);
  step();

  expect(calls).toEqual([
    { left: true, right: false, middle: false, mouse4: false, mouse5: false },
    { left: false, right: false, middle: true, mouse4: false, mouse5: false },
    { left: false, right: true, middle: false, mouse4: false, mouse5: false },
    { left: false, right: false, middle: false, mouse4: true, mouse5: false },
    { left: false, right: false, middle: false, mouse4: false, mouse5: true },
    { left: false, right: true, middle: false, mouse4: false, mouse5: false },
  ]);
});

test("every callback receives the same, mutated HexMouseEvent instance", () => {
  const events: Array<HexMouseEvent> = [];

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      const mouse = useNewComponent(() =>
        LowLevelMouse({ positionsRelativeTo: "screen" })
      );
      const record = (event: HexMouseEvent) => {
        events.push(event);
      };
      mouse.onMouseMove(record);
      mouse.onMouseMove(record);
      mouse.onMouseDown(record);
    });
  });

  mouseMove(10, 10);
  step();
  mouseDown(20, 20);
  step();

  expect(events.length).toBe(3);
  expect(events.every((event) => event === events[0])).toBe(true);
  expect(xy(events[0].pos)).toEqual({ x: 20, y: 20 });
});

test("touch events are reported as left-button down, move, and up", () => {
  const calls: Array<string> = [];

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      const mouse = useNewComponent(() =>
        LowLevelMouse({ positionsRelativeTo: "screen" })
      );
      const record = (name: string) => (event: HexMouseEvent) => {
        const pos = xy(event.pos);
        calls.push(`${name} ${pos.x},${pos.y} left=${event.buttons.left}`);
      };
      mouse.onMouseDown(record("down"));
      mouse.onMouseMove(record("move"));
      mouse.onMouseUp(record("up"));
    });
  });

  touchStart(50, 60);
  step();
  touchMove(70, 80);
  step();
  touchEnd(70, 80);
  step();

  // A touchstart reports where the touch landed before reporting the press, so
  // that listeners which hit-test have a position to work from.
  expect(calls).toEqual([
    "move 50,60 left=true",
    "down 50,60 left=true",
    "move 70,80 left=true",
    "up 70,80 left=true",
  ]);
});

test("a second touchstart while already touching is ignored", () => {
  const calls: Array<string> = [];

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      const mouse = useNewComponent(() =>
        LowLevelMouse({ positionsRelativeTo: "screen" })
      );
      mouse.onMouseDown((event) => calls.push(`down ${xy(event.pos).x}`));
      mouse.onMouseUp((event) => calls.push(`up ${xy(event.pos).x}`));
    });
  });

  touchStart(10, 0);
  step();
  touchStart(20, 0);
  step();
  touchEnd(20, 0);
  step();
  touchEnd(30, 0);
  step();

  expect(calls).toEqual(["down 10", "up 20"]);
});

test("a disabled LowLevelMouse delivers no move, down, or up events", () => {
  const calls: Array<string> = [];
  let mouse!: ReturnType<typeof LowLevelMouse> & Component;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      mouse = useNewComponent(() =>
        LowLevelMouse({ positionsRelativeTo: "screen" })
      );
      mouse.onMouseMove(() => calls.push("move"));
      mouse.onMouseDown(() => calls.push("down"));
      mouse.onMouseUp(() => calls.push("up"));
    });
  });

  mouseMove(10, 10);
  step();
  expect(calls).toEqual(["move"]);

  mouse.disable();
  mouseMove(20, 20);
  mouseDown(20, 20);
  mouseUp(20, 20);
  step();
  expect(calls).toEqual(["move"]);

  mouse.enable();
  step();
  expect(calls).toEqual(["move"]);

  // Events that arrived before the component was disabled are dropped too,
  // rather than waiting in the queue for it to come back.
  mouseMove(30, 30);
  mouse.disable();
  step();
  mouse.enable();
  step();
  expect(calls).toEqual(["move"]);

  mouseMove(40, 40);
  step();
  expect(calls).toEqual(["move", "move"]);
});

test("a disabled LowLevelMouse delivers no canvas enter or leave events", () => {
  const calls: Array<string> = [];
  let mouse!: ReturnType<typeof LowLevelMouse> & Component;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      mouse = useNewComponent(() =>
        LowLevelMouse({ positionsRelativeTo: "screen" })
      );
      mouse.onCanvasEnter(() => calls.push("enter"));
      mouse.onCanvasLeave(() => calls.push("leave"));
    });
  });

  mouse.disable();
  mouseOver(10, 10);
  mouseOut(20, 20);
  step();
  expect(calls).toEqual([]);

  mouse.enable();
  step();
  expect(calls).toEqual([]);

  mouseOver(30, 30);
  step();
  expect(calls).toEqual(["enter"]);
});

/**
 * Counts what a scene adds to and removes from the canvas over its whole life,
 * by spying on HTMLCanvasElement's own methods.
 */
function countCanvasListeners(scene: () => void) {
  let added = 0;
  let removed = 0;

  const realAdd = HTMLCanvasElement.prototype.addEventListener;
  const realRemove = HTMLCanvasElement.prototype.removeEventListener;

  HTMLCanvasElement.prototype.addEventListener = function (
    this: HTMLCanvasElement,
    ...args: Parameters<typeof realAdd>
  ) {
    added++;
    return realAdd.apply(this, args);
  };
  HTMLCanvasElement.prototype.removeEventListener = function (
    this: HTMLCanvasElement,
    ...args: Parameters<typeof realRemove>
  ) {
    removed++;
    return realRemove.apply(this, args);
  };

  try {
    startGame(scene);
    endGame();
  } finally {
    HTMLCanvasElement.prototype.addEventListener = realAdd;
    HTMLCanvasElement.prototype.removeEventListener = realRemove;
  }

  return { added, removed };
}

test("the canvas gets one listener per event type no matter how many Components listen", () => {
  const subjects = (count: number) => () => {
    for (let index = 0; index < count; index++) {
      useChild(function Subject() {
        useType(Subject);

        useNewComponent(() =>
          Geometry({
            shape: Polygon.rectangle(40, 40),
            position: new Vector(100, 100),
          })
        );
        useNewComponent(LowLevelMouse);
        useNewComponent(LowLevelMouse);
      });
    }
  };

  const one = countCanvasListeners(subjects(1));
  const many = countCanvasListeners(subjects(50));

  expect(many.added).toBe(one.added);
  // The five mouse events and three touch events, plus the contextmenu
  // listener Canvas adds for itself.
  expect(many.added).toBe(9);
  // Everything except Canvas's own contextmenu listener comes back off once the
  // last LowLevelMouse goes away.
  expect(many.removed).toBe(8);
});

test("every LowLevelMouse in the Entity tree receives the same event", () => {
  const calls: Array<string> = [];

  startGame(() => {
    useChild(function First() {
      useType(First);

      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(40, 40),
          position: new Vector(100, 100),
        })
      );
      useNewComponent(LowLevelMouse).onMouseMove((event) =>
        calls.push(`first ${xy(event.pos).x}`)
      );
    });

    useChild(function Second() {
      useType(Second);

      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(40, 40),
          position: new Vector(300, 100),
        })
      );
      useNewComponent(LowLevelMouse).onMouseMove((event) =>
        calls.push(`second ${xy(event.pos).x}`)
      );
    });
  });

  mouseMove(150, 100);
  step();

  expect(calls).toEqual(["first 50", "second -150"]);
});

test("a LowLevelMouse added after the game started receives events", () => {
  const calls: Array<string> = [];

  const root = startGame(() => {});

  mouseMove(10, 10);
  step();

  root.createChild(function LateSubject() {
    useType(LateSubject);

    useNewComponent(() =>
      LowLevelMouse({ positionsRelativeTo: "screen" })
    ).onMouseMove((event) => calls.push(`move ${xy(event.pos).x}`));
  });

  mouseMove(20, 20);
  step();

  expect(calls).toEqual(["move 20"]);
});

test("a removed LowLevelMouse Component stops receiving events", () => {
  const calls: Array<string> = [];
  let entity!: Entity;
  let mouse!: ReturnType<typeof LowLevelMouse> & Component;

  startGame(() => {
    entity = useChild(function Subject() {
      useType(Subject);

      mouse = useNewComponent(() =>
        LowLevelMouse({ positionsRelativeTo: "screen" })
      );
      mouse.onMouseMove(() => calls.push("move"));
    });
  });

  mouseMove(10, 10);
  step();
  expect(calls).toEqual(["move"]);

  entity.removeComponent(mouse);
  mouseMove(20, 20);
  step();
  expect(calls).toEqual(["move"]);
});

test("a destroyed Entity's LowLevelMouse stops receiving events", () => {
  const calls: Array<string> = [];

  const root = startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      useNewComponent(() =>
        LowLevelMouse({ positionsRelativeTo: "screen" })
      ).onMouseMove(() => calls.push("move"));
    });
  });

  mouseMove(10, 10);
  step();
  expect(calls).toEqual(["move"]);

  [...root.children][0].destroy();
  mouseMove(20, 20);
  step();
  expect(calls).toEqual(["move"]);
});
