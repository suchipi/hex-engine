/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import Animation, { AnimationFrame, AnimationAPI } from "./Animation";
import AnimationSheet from "./AnimationSheet";
import Image from "./Image";
import SpriteSheet from "./SpriteSheet";
import { endGame, startGame, step } from "./inputTestSetup";
import tilesetUrl from "../__fixtures__/tileset.png";

// tileset.png is 32x8: a row of four 8x8 tiles.
const TILE_SIZE = 8;
const FRAME_DURATION = 40;
const STEPS_PER_FRAME = 3;

afterEach(endGame);

function tileFrames(tileIndices: Array<number>) {
  return tileIndices.map(
    (tileIndex) => new AnimationFrame(tileIndex, { duration: FRAME_DURATION })
  );
}

function startWithSheet(animationsByName: { [name: string]: Array<number> }): {
  sheet: ReturnType<typeof AnimationSheet>;
  image: ReturnType<typeof Image>;
  animations: { [name: string]: AnimationAPI<number> };
} {
  let sheet!: ReturnType<typeof AnimationSheet>;
  let image!: ReturnType<typeof Image>;
  const animations: { [name: string]: AnimationAPI<number> } = {};

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      for (const name of Object.keys(animationsByName)) {
        animations[name] = useNewComponent(() =>
          Animation(tileFrames(animationsByName[name]))
        );
      }

      sheet = useNewComponent(() =>
        AnimationSheet({
          url: tilesetUrl,
          tileWidth: TILE_SIZE,
          tileHeight: TILE_SIZE,
          animations,
        })
      );

      image = useNewComponent(() => Image({ url: tilesetUrl }));
    });
  });

  return { sheet, image, animations };
}

function blankContext(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext("2d")!;
}

function pixels(context: CanvasRenderingContext2D) {
  return Array.from(
    context.getImageData(0, 0, context.canvas.width, context.canvas.height).data
  );
}

function tilePixels(image: ReturnType<typeof Image>, tileIndex: number) {
  const context = blankContext(TILE_SIZE, TILE_SIZE);
  context.drawImage(
    image.data!,
    tileIndex * TILE_SIZE,
    0,
    TILE_SIZE,
    TILE_SIZE,
    0,
    0,
    TILE_SIZE,
    TILE_SIZE
  );
  return pixels(context);
}

test("an AnimationSheet starts on the animation called default", () => {
  const { sheet, animations } = startWithSheet({ default: [0, 1] });

  expect(sheet.currentAnim).toBe(animations.default);
});

test("currentAnim can be pointed at another animation", () => {
  const { sheet, animations } = startWithSheet({
    default: [0, 1],
    walk: [2, 3],
  });

  sheet.currentAnim = animations.walk;

  expect(sheet.currentAnim).toBe(animations.walk);
});

test("it draws the tile that the current animation is on", async () => {
  const { sheet, image } = startWithSheet({ default: [2] });
  await image.load();

  const drawn = blankContext(TILE_SIZE, TILE_SIZE);
  sheet.draw(drawn);

  expect(pixels(drawn)).toEqual(tilePixels(image, 2));
});

test("the drawn tile follows the animation as it plays", async () => {
  const { sheet, image, animations } = startWithSheet({ default: [0, 3] });
  await image.load();

  animations.default.play();

  const first = blankContext(TILE_SIZE, TILE_SIZE);
  sheet.draw(first);
  expect(pixels(first)).toEqual(tilePixels(image, 0));

  for (let index = 0; index < STEPS_PER_FRAME; index++) step();

  const second = blankContext(TILE_SIZE, TILE_SIZE);
  sheet.draw(second);
  expect(pixels(second)).toEqual(tilePixels(image, 3));
});

test("switching animation switches which tile is drawn", async () => {
  const { sheet, image, animations } = startWithSheet({
    default: [0],
    walk: [3],
  });
  await image.load();

  sheet.currentAnim = animations.walk;

  const drawn = blankContext(TILE_SIZE, TILE_SIZE);
  sheet.draw(drawn);

  expect(pixels(drawn)).toEqual(tilePixels(image, 3));
});

test("x and y move where the frame lands", async () => {
  const { sheet, image } = startWithSheet({ default: [1] });
  await image.load();

  const drawn = blankContext(TILE_SIZE * 2, TILE_SIZE * 2);
  sheet.draw(drawn, { x: TILE_SIZE, y: TILE_SIZE });

  const expected = blankContext(TILE_SIZE * 2, TILE_SIZE * 2);
  expected.drawImage(
    image.data!,
    TILE_SIZE,
    0,
    TILE_SIZE,
    TILE_SIZE,
    TILE_SIZE,
    TILE_SIZE,
    TILE_SIZE,
    TILE_SIZE
  );

  expect(pixels(drawn)).toEqual(pixels(expected));
});

test("width and height scale the frame as it is drawn", async () => {
  const { sheet, image } = startWithSheet({ default: [0] });
  await image.load();

  const drawn = blankContext(TILE_SIZE * 2, TILE_SIZE * 2);
  sheet.draw(drawn, { width: TILE_SIZE * 2, height: TILE_SIZE * 2 });

  const expected = blankContext(TILE_SIZE * 2, TILE_SIZE * 2);
  expected.drawImage(
    image.data!,
    0,
    0,
    TILE_SIZE,
    TILE_SIZE,
    0,
    0,
    TILE_SIZE * 2,
    TILE_SIZE * 2
  );

  expect(pixels(drawn)).toEqual(pixels(expected));
});

test("drawing before the sheet image has loaded does nothing", () => {
  const { sheet } = startWithSheet({ default: [0] });
  const context = blankContext(TILE_SIZE, TILE_SIZE);
  const before = pixels(context);

  sheet.draw(context);

  expect(pixels(context)).toEqual(before);
});

test("an AnimationSheet builds a SpriteSheet of its own", () => {
  let entity!: ReturnType<typeof useChild>;

  startGame(() => {
    entity = useChild(function Subject() {
      useType(Subject);

      const animations = {
        default: useNewComponent(() => Animation(tileFrames([0]))),
      };

      useNewComponent(() =>
        AnimationSheet({
          url: tilesetUrl,
          tileWidth: TILE_SIZE,
          tileHeight: TILE_SIZE,
          animations,
        })
      );
    });
  });

  expect(entity.hasComponent(SpriteSheet)).toBe(true);
});

test("known quirk: an AnimationSheet with no animation called default draws nothing and cannot be drawn from", () => {
  const { sheet } = startWithSheet({ walk: [0, 1] });

  // currentAnim is seeded from animations.default without checking, so a sheet
  // whose animations are all named something else starts out unusable.
  expect(sheet.currentAnim).toBe(undefined as never);
  expect(() => sheet.draw(blankContext(TILE_SIZE, TILE_SIZE))).toThrowError();
});
