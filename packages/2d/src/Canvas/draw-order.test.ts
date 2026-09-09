/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import Geometry from "../Components/Geometry";
import { Polygon, Vector } from "../Models";
import { useDraw, useUpdate } from "../Hooks";
import useContext from "../Hooks/useContext";
import { endGame, startGame, step } from "../Components/inputTestSetup";
import { useRawDraw } from "./DrawChildren";

let calls: Array<string> = [];

beforeEach(() => {
  calls = [];
});

afterEach(endGame);

function isRed(context: CanvasRenderingContext2D, x: number, y: number) {
  const [r, g, b] = context.getImageData(x, y, 1, 1).data;
  return r > 200 && g < 50 && b < 50;
}

test("draw callbacks run in Entity creation order, so later Entities land on top", () => {
  startGame(() => {
    useChild(function First() {
      useType(First);
      useRawDraw(() => calls.push("first"));
    });
    useChild(function Second() {
      useType(Second);
      useRawDraw(() => calls.push("second"));
    });
  });

  step();

  expect(calls).toEqual(["first", "second"]);
});

test("one Component's draw callbacks run in the order they were registered", () => {
  startGame(() => {
    useChild(function Subject() {
      useType(Subject);
      useRawDraw(() => calls.push("a"));
      useRawDraw(() => calls.push("b"));
      useRawDraw(() => calls.push("c"));
    });
  });

  step();

  expect(calls).toEqual(["a", "b", "c"]);
});

test("Components that draw debug overlays are left until last", () => {
  startGame(() => {
    useChild(function WithGeometry() {
      useType(WithGeometry);

      // Geometry registers debug-overlay draws for the inspector.
      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(10, 10),
          position: new Vector(0, 0),
        })
      );
      useRawDraw(() => calls.push("normal draw on the first Entity"));
    });

    useChild(function Later() {
      useType(Later);
      useRawDraw(() => calls.push("normal draw on a later Entity"));
    });
  });

  step();

  // Both plain draws happen before the overlays, even though the first
  // Entity's Geometry was created before the second Entity existed.
  expect(calls).toEqual([
    "normal draw on the first Entity",
    "normal draw on a later Entity",
  ]);
});

test("a disabled Component does not draw", () => {
  let component!: { disable(): void; enable(): void };

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);
      component = useNewComponent(function Drawer() {
        useType(Drawer);
        useRawDraw(() => calls.push("draw"));
      });
    });
  });

  step();
  expect(calls).toEqual(["draw"]);

  component.disable();
  step();
  expect(calls).toEqual(["draw"]);

  component.enable();
  step();
  expect(calls).toEqual(["draw", "draw"]);
});

test("useDraw moves the context to the Entity's top-left corner", () => {
  let context!: CanvasRenderingContext2D;

  startGame(() => {
    context = useContext();

    useChild(function Subject() {
      useType(Subject);

      const geometry = useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(20, 20),
          position: new Vector(100, 100),
        })
      );

      useDraw((drawContext) => {
        drawContext.fillStyle = "red";
        geometry.shape.draw(drawContext, "fill");
      });
    });
  });

  step();

  // A 20x20 box centered on 100,100 covers 90..110.
  expect(isRed(context, 100, 100)).toBe(true);
  expect(isRed(context, 92, 92)).toBe(true);
  expect(isRed(context, 85, 100)).toBe(false);
  expect(isRed(context, 115, 100)).toBe(false);
});

test("useRawDraw leaves the context where it found it", () => {
  let context!: CanvasRenderingContext2D;

  startGame(() => {
    context = useContext();

    useChild(function Subject() {
      useType(Subject);

      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(20, 20),
          position: new Vector(100, 100),
        })
      );

      useRawDraw((drawContext) => {
        drawContext.fillStyle = "red";
        drawContext.fillRect(0, 0, 10, 10);
      });
    });
  });

  step();

  // The Entity's position is ignored, so the rect lands at the canvas origin.
  expect(isRed(context, 5, 5)).toBe(true);
  expect(isRed(context, 100, 100)).toBe(false);
});

test("useDraw accounts for the Entity's rotation and scale", () => {
  let context!: CanvasRenderingContext2D;

  startGame(() => {
    context = useContext();

    useChild(function Subject() {
      useType(Subject);

      const geometry = useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(20, 10),
          position: new Vector(100, 100),
          rotation: Math.PI / 2,
        })
      );

      useDraw((drawContext) => {
        drawContext.fillStyle = "red";
        geometry.shape.draw(drawContext, "fill");
      });
    });
  });

  step();

  // Turned a quarter turn, the 20x10 bar becomes 10 wide and 20 tall.
  expect(isRed(context, 100, 108)).toBe(true);
  expect(isRed(context, 108, 100)).toBe(false);
});

test("with a null background colour, nothing repaints over the previous frame", () => {
  let context!: CanvasRenderingContext2D;
  let shouldDraw = true;

  startGame(() => {
    context = useContext();

    useChild(function Subject() {
      useType(Subject);

      useRawDraw((drawContext) => {
        if (!shouldDraw) return;
        drawContext.fillStyle = "red";
        drawContext.fillRect(0, 0, 10, 10);
      });
    });
  });

  step();
  expect(isRed(context, 5, 5)).toBe(true);

  shouldDraw = false;
  step();

  // DrawChildren only clears when it was given a colour, so last frame's
  // pixels stay put.
  expect(isRed(context, 5, 5)).toBe(true);
});

test("every update callback runs before any draw callback, whatever order they registered in", () => {
  startGame(() => {
    useChild(function DrawsFirst() {
      useType(DrawsFirst);
      useRawDraw(() => calls.push("draw on the first Entity"));
      useUpdate(() => calls.push("update on the first Entity"));
    });

    useChild(function UpdatesLater() {
      useType(UpdatesLater);
      useUpdate(() => calls.push("update on a later Entity"));
      useRawDraw(() => calls.push("draw on a later Entity"));
    });
  });

  step();

  expect(calls).toEqual([
    "update on the first Entity",
    "update on a later Entity",
    "draw on the first Entity",
    "draw on a later Entity",
  ]);
});
