/// <reference types="@test-it/core/globals" />
import {
  Component,
  useChild,
  useNewComponent,
  useType,
} from "@hex-engine/core";
import Geometry from "../Components/Geometry";
import { Polygon, Vector } from "../Models";
import useContext from "./useContext";
import useInspectorHoverOutline from "./useInspectorHoverOutline";
import { endGame, startGame, step } from "../Components/inputTestSetup";

afterEach(endGame);

type HoverStorage = {
  beginCallbacks: WeakMap<Component, Set<() => void>>;
  endCallbacks: WeakMap<Component, Set<() => void>>;
};

/**
 * The storage useInspectorHover shares with the Inspector's tree view. It is
 * not part of the inspector package's public exports, so it is found by the
 * type name it registered.
 */
function hoverStorage(component: Component): HoverStorage {
  for (const candidate of component.entity.components) {
    if (candidate.type && candidate.type.name === "StorageForInspectorHover") {
      return candidate as unknown as HoverStorage;
    }
  }
  throw new Error("no hover storage on that Entity");
}

/** Drives the hover callbacks the way the Inspector's tree view does. */
function setHovered(component: Component, hovered: boolean) {
  const storage = hoverStorage(component);
  const callbacks = hovered
    ? storage.beginCallbacks.get(component)
    : storage.endCallbacks.get(component);

  if (!callbacks) throw new Error("no hover callbacks for that Component");
  callbacks.forEach((callback) => callback());
}

function startWithOutline(
  getShape: () => Polygon = () => Polygon.rectangle(40, 40)
) {
  let component!: Component;
  let context!: CanvasRenderingContext2D;

  startGame(() => {
    context = useContext();

    useChild(function Subject() {
      useType(Subject);

      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(40, 40),
          position: new Vector(100, 100),
        })
      );

      component = useNewComponent(function Outlined() {
        useType(Outlined);
        useInspectorHoverOutline(getShape);
      });
    });
  });

  return { component, context };
}

/** Draws one frame onto a blank canvas, and reports how much was drawn. */
function pixelsDrawnThisFrame(context: CanvasRenderingContext2D) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  step();

  const data = context.getImageData(
    0,
    0,
    context.canvas.width,
    context.canvas.height
  ).data;

  let count = 0;
  for (let index = 3; index < data.length; index += 4) {
    if (data[index] > 0) count++;
  }
  return count;
}

test("nothing is outlined until the Component is hovered in the Inspector", () => {
  const { context } = startWithOutline();

  expect(pixelsDrawnThisFrame(context)).toBe(0);
});

test("hovering draws an outline", () => {
  const { component, context } = startWithOutline();

  setHovered(component, true);

  expect(pixelsDrawnThisFrame(context)).toBeGreaterThan(0);
});

test("unhovering takes the outline away again", () => {
  const { component, context } = startWithOutline();

  setHovered(component, true);
  expect(pixelsDrawnThisFrame(context)).toBeGreaterThan(0);

  setHovered(component, false);
  expect(pixelsDrawnThisFrame(context)).toBe(0);
});

test("the outline is drawn from whatever shape the callback returns", () => {
  let shape = Polygon.rectangle(10, 10);
  const { component, context } = startWithOutline(() => shape);

  setHovered(component, true);
  const small = pixelsDrawnThisFrame(context);

  shape = Polygon.rectangle(80, 80);
  const large = pixelsDrawnThisFrame(context);

  expect(small).toBeGreaterThan(0);
  expect(large).toBeGreaterThan(small);
});

test("each Component hovers independently", () => {
  let first!: Component;
  let second!: Component;
  let context!: CanvasRenderingContext2D;

  startGame(() => {
    context = useContext();

    useChild(function Subject() {
      useType(Subject);

      useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(40, 40),
          position: new Vector(100, 100),
        })
      );

      first = useNewComponent(function First() {
        useType(First);
        useInspectorHoverOutline(() => Polygon.rectangle(20, 20));
      });
      second = useNewComponent(function Second() {
        useType(Second);
        useInspectorHoverOutline(() => Polygon.rectangle(20, 20));
      });
    });
  });

  setHovered(first, true);
  const justFirst = pixelsDrawnThisFrame(context);

  setHovered(second, true);
  const both = pixelsDrawnThisFrame(context);

  expect(justFirst).toBeGreaterThan(0);
  expect(both).toBeGreaterThan(0);

  setHovered(first, false);
  setHovered(second, false);
  expect(pixelsDrawnThisFrame(context)).toBe(0);
});

test("a disabled Component does not draw its outline", () => {
  const { component, context } = startWithOutline();

  setHovered(component, true);
  expect(pixelsDrawnThisFrame(context)).toBeGreaterThan(0);

  component.disable();
  expect(pixelsDrawnThisFrame(context)).toBe(0);
});
