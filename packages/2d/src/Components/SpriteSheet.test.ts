/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import Image from "./Image";
import SpriteSheet from "./SpriteSheet";
import { endGame, startGame, xy } from "./inputTestSetup";
import tilesetUrl from "../__fixtures__/tileset.png";

// tileset.png is 32x8: a row of four 8x8 tiles.
const TILE_SIZE = 8;
const TILE_COUNT = 4;

afterEach(endGame);

function startWithSheet(
  tileWidth: number = TILE_SIZE,
  tileHeight: number = TILE_SIZE
) {
  let sheet!: ReturnType<typeof SpriteSheet>;
  let image!: ReturnType<typeof Image>;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);
      sheet = useNewComponent(() =>
        SpriteSheet({ url: tilesetUrl, tileWidth, tileHeight })
      );
      image = useNewComponent(() => Image({ url: tilesetUrl }));
    });
  });

  return { sheet, image };
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

test("tileSize reports the tile dimensions it was given", () => {
  const { sheet } = startWithSheet(8, 16);

  expect(xy(sheet.tileSize)).toEqual({ x: 8, y: 16 });
});

test("drawing before the sheet's image has loaded does nothing", () => {
  const { sheet } = startWithSheet();
  const context = blankContext(TILE_SIZE, TILE_SIZE);
  const before = pixels(context);

  sheet.draw(context, { tileIndex: 0 });

  expect(pixels(context)).toEqual(before);
});

test("each tile index draws its own slice of the sheet", async () => {
  const { sheet, image } = startWithSheet();
  await image.load();

  for (let tileIndex = 0; tileIndex < TILE_COUNT; tileIndex++) {
    const drawn = blankContext(TILE_SIZE, TILE_SIZE);
    sheet.draw(drawn, { tileIndex });

    const expected = blankContext(TILE_SIZE, TILE_SIZE);
    expected.drawImage(
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

    expect(pixels(drawn)).toEqual(pixels(expected));
  }
});

test("neighbouring tiles are not the same slice", async () => {
  const { sheet, image } = startWithSheet();
  await image.load();

  const first = blankContext(TILE_SIZE, TILE_SIZE);
  sheet.draw(first, { tileIndex: 0 });

  const second = blankContext(TILE_SIZE, TILE_SIZE);
  sheet.draw(second, { tileIndex: 1 });

  expect(pixels(first)).not.toEqual(pixels(second));
});

test("x and y move where the tile lands on the canvas", async () => {
  const { sheet, image } = startWithSheet();
  await image.load();

  const drawn = blankContext(TILE_SIZE * 2, TILE_SIZE * 2);
  sheet.draw(drawn, { tileIndex: 1, x: TILE_SIZE, y: TILE_SIZE });

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

test("width and height scale the tile as it is drawn", async () => {
  const { sheet, image } = startWithSheet();
  await image.load();

  const drawn = blankContext(TILE_SIZE * 2, TILE_SIZE * 2);
  sheet.draw(drawn, {
    tileIndex: 0,
    width: TILE_SIZE * 2,
    height: TILE_SIZE * 2,
  });

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

test("indices wrap onto later rows once a row is full", async () => {
  // Treating the 32x8 sheet as 16x8 tiles makes it two columns by one row...
  const { sheet, image } = startWithSheet(16, 8);
  await image.load();

  // ...so index 2 starts a second row, which is off the bottom of this image.
  const drawn = blankContext(16, 8);
  sheet.draw(drawn, { tileIndex: 2 });

  const expected = blankContext(16, 8);
  expected.drawImage(image.data!, 0, 8, 16, 8, 0, 0, 16, 8);

  expect(pixels(drawn)).toEqual(pixels(expected));
});

test("a tile index past the end of the sheet draws nothing visible", async () => {
  const { sheet, image } = startWithSheet();
  await image.load();

  const drawn = blankContext(TILE_SIZE, TILE_SIZE);
  const before = pixels(drawn);

  sheet.draw(drawn, { tileIndex: 99 });

  expect(pixels(drawn)).toEqual(before);
});
