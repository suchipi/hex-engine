/// <reference types="@test-it/core/globals" />
import {
  Component,
  useChild,
  useNewComponent,
  useType,
} from "@hex-engine/core";
import {
  CANVAS_SIZE,
  canvasBoundingRect,
  endGame,
  startGame,
  step,
  xy,
} from "../Components/inputTestSetup";
import useCanvasSize from "./useCanvasSize";
import useContext from "./useContext";

let calls: Array<string> = [];

beforeEach(() => {
  calls = [];
});

afterEach(endGame);

function startWatchingCanvasSize() {
  let api!: ReturnType<typeof useCanvasSize>;
  let component!: Component;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      component = useNewComponent(function Watcher() {
        useType(Watcher);
        api = useCanvasSize();
        api.onCanvasResize(() => calls.push("resized"));
      });
    });
  });

  return { api, component };
}

test("canvasSize starts out matching the canvas", () => {
  const { api } = startWatchingCanvasSize();

  expect(xy(api.canvasSize)).toEqual({ x: CANVAS_SIZE, y: CANVAS_SIZE });
});

test("resizeCanvas changes the backing store and the displayed size separately", () => {
  const { api } = startWatchingCanvasSize();

  api.resizeCanvas({
    realWidth: 200,
    realHeight: 100,
    pixelWidth: 50,
    pixelHeight: 25,
  });

  expect(xy(api.canvasSize)).toEqual({ x: 50, y: 25 });

  const rect = canvasBoundingRect();
  expect({ width: rect.width, height: rect.height }).toEqual({
    width: 200,
    height: 100,
  });
});

test("realWidth and realHeight also accept CSS strings", () => {
  const { api } = startWatchingCanvasSize();

  api.resizeCanvas({
    realWidth: "150px",
    realHeight: "75px",
    pixelWidth: 30,
    pixelHeight: 15,
  });

  const rect = canvasBoundingRect();
  expect({ width: rect.width, height: rect.height }).toEqual({
    width: 150,
    height: 75,
  });
});

test("the same canvasSize Vector is kept up to date rather than replaced", () => {
  const { api } = startWatchingCanvasSize();
  const original = api.canvasSize;

  api.resizeCanvas({
    realWidth: 10,
    realHeight: 10,
    pixelWidth: 10,
    pixelHeight: 10,
  });

  expect(api.canvasSize).toBe(original);
  expect(xy(original)).toEqual({ x: 10, y: 10 });
});

test("onCanvasResize handlers run as soon as resizeCanvas is called", () => {
  const { api } = startWatchingCanvasSize();

  expect(calls).toEqual([]);

  api.resizeCanvas({
    realWidth: 10,
    realHeight: 10,
    pixelWidth: 10,
    pixelHeight: 10,
  });

  // No frame is needed; the listeners fire from inside resizeCanvas.
  expect(calls).toEqual(["resized"]);
});

test("a disabled Component does not hear about resizes", () => {
  const { api, component } = startWatchingCanvasSize();

  component.disable();
  api.resizeCanvas({
    realWidth: 10,
    realHeight: 10,
    pixelWidth: 10,
    pixelHeight: 10,
  });
  expect(calls).toEqual([]);

  component.enable();
  api.resizeCanvas({
    realWidth: 20,
    realHeight: 20,
    pixelWidth: 20,
    pixelHeight: 20,
  });
  expect(calls).toEqual(["resized"]);
});

test("known quirk: resizing fires the handlers even when nothing actually changed", () => {
  const { api } = startWatchingCanvasSize();

  const same = {
    realWidth: CANVAS_SIZE,
    realHeight: CANVAS_SIZE,
    pixelWidth: CANVAS_SIZE,
    pixelHeight: CANVAS_SIZE,
  };

  api.resizeCanvas(same);
  api.resizeCanvas(same);

  // resizeCanvas has no equality check of its own, unlike the window-resize
  // path, which only notifies when a dimension really moved.
  expect(calls).toEqual(["resized", "resized"]);
});

test("known quirk: setting the canvas size directly leaves canvasSize stale", () => {
  let api!: ReturnType<typeof useCanvasSize>;
  let context!: CanvasRenderingContext2D;

  startGame(() => {
    context = useContext();

    useChild(function Subject() {
      useType(Subject);
      useNewComponent(function Watcher() {
        useType(Watcher);
        api = useCanvasSize();
      });
    });
  });

  context.canvas.width = 123;
  step();

  // Only resizeCanvas and the window-resize listener update the Vector, so a
  // game that touches canvas.width itself gets a size that disagrees with it.
  expect(context.canvas.width).toBe(123);
  expect(api.canvasSize.x).toBe(CANVAS_SIZE);
});
