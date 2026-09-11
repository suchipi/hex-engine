/// <reference types="@test-it/core/globals" />
import {
  Component,
  useChild,
  useNewComponent,
  useType,
} from "@hex-engine/core";
import Animation from "./Animation";
import Aseprite from "./Aseprite";
import { endGame, startGame, xy } from "./inputTestSetup";
import sprite from "../__fixtures__/sprite.aseprite";

afterEach(endGame);

function startWithSprite() {
  let aseprite!: ReturnType<typeof Aseprite> & Component;
  let entity!: ReturnType<typeof useChild>;

  startGame(() => {
    entity = useChild(function Subject() {
      useType(Subject);
      aseprite = useNewComponent(() => Aseprite(sprite));
    });
  });

  return { aseprite, entity };
}

function blankContext(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext("2d")!;
}

function filledPixelCount(context: CanvasRenderingContext2D) {
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

test("the loader hands over parsed Aseprite data", () => {
  expect(sprite.frames.length).toBeGreaterThan(0);
  expect(typeof sprite.colorDepth).toBe("number");
});

test("an Aseprite keeps the data it was given", () => {
  const { aseprite } = startWithSprite();

  expect(aseprite.data).toBe(sprite);
});

test("size is the largest extent of any cel in the file", () => {
  const { aseprite } = startWithSprite();

  const widest = Math.max(
    ...sprite.frames.map((frame) =>
      Math.max(...frame.cels.map((cel) => cel.w + cel.xpos))
    )
  );
  const tallest = Math.max(
    ...sprite.frames.map((frame) =>
      Math.max(...frame.cels.map((cel) => cel.h + cel.ypos))
    )
  );

  expect(xy(aseprite.size)).toEqual({ x: widest, y: tallest });
});

test("there is always an animation called default containing every frame", () => {
  const { aseprite } = startWithSprite();

  expect(aseprite.animations.default).not.toBe(undefined);
  expect(aseprite.animations.default.frames.length).toBe(sprite.frames.length);
});

test("each tag in the file becomes an animation of its own", () => {
  const { aseprite } = startWithSprite();

  for (const tag of sprite.tags) {
    expect(aseprite.animations[tag.name]).not.toBe(undefined);
  }
});

test("currentAnim starts as the default animation and can be changed", () => {
  const { aseprite } = startWithSprite();

  expect(aseprite.currentAnim).toBe(aseprite.animations.default);

  const otherName = Object.keys(aseprite.animations).find(
    (name) => name !== "default"
  );
  if (otherName) {
    aseprite.currentAnim = aseprite.animations[otherName];
    expect(aseprite.currentAnim).toBe(aseprite.animations[otherName]);
  }
});

test("every frame is turned into a canvas the size of the file", () => {
  const { aseprite } = startWithSprite();

  for (const frame of aseprite.animations.default.frames) {
    expect(frame.data).toBeInstanceOf(HTMLCanvasElement);
    expect(frame.data.width).toBe(aseprite.size.x);
    expect(frame.data.height).toBe(aseprite.size.y);
  }
});

test("frame durations come from the file", () => {
  const { aseprite } = startWithSprite();

  aseprite.animations.default.frames.forEach((frame, index) => {
    expect(frame.duration).toBe(sprite.frames[index].frameDuration);
  });
});

test("drawing puts the current frame's pixels on the canvas", () => {
  const { aseprite } = startWithSprite();
  const context = blankContext(aseprite.size.x, aseprite.size.y);

  aseprite.draw(context);

  expect(filledPixelCount(context)).toBeGreaterThan(0);
});

test("x and y move where the frame lands", () => {
  const { aseprite } = startWithSprite();

  const context = blankContext(aseprite.size.x * 2, aseprite.size.y * 2);
  aseprite.draw(context, { x: aseprite.size.x, y: aseprite.size.y });

  const topLeft = context.getImageData(
    0,
    0,
    aseprite.size.x,
    aseprite.size.y
  ).data;
  let topLeftFilled = 0;
  for (let index = 3; index < topLeft.length; index += 4) {
    if (topLeft[index] > 0) topLeftFilled++;
  }

  expect(topLeftFilled).toBe(0);
  expect(filledPixelCount(context)).toBeGreaterThan(0);
});

test("the frame canvases are reused rather than redrawn per Component", () => {
  const { aseprite } = startWithSprite();
  const firstFrames = aseprite.animations.default.frames.map(
    (frame) => frame.data
  );

  endGame();
  const second = startWithSprite();

  // A module-level cache keyed on the frame means two Aseprite Components over
  // the same file share the canvases that were rendered for it.
  expect(
    second.aseprite.animations.default.frames.map((frame) => frame.data)
  ).toEqual(firstFrames);
});

test("disabling an Aseprite disables the animations it built", () => {
  const { aseprite } = startWithSprite();

  const animation = aseprite.animations.default as unknown as Component;
  expect(animation.isEnabled).toBe(true);

  aseprite.disable();
  expect(animation.isEnabled).toBe(false);

  aseprite.enable();
  expect(animation.isEnabled).toBe(true);
});

test("an Aseprite builds an Animation Component for each of its animations", () => {
  const { entity } = startWithSprite();

  expect(entity.hasComponent(Animation)).toBe(true);
});
