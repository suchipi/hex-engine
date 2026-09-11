/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import Image from "./Image";
import SpriteSheet from "./SpriteSheet";
import TileMap from "./TileMap";
import { Grid } from "../Models";
import { endGame, startGame } from "./inputTestSetup";
import tilesetUrl from "../__fixtures__/tileset.png";

// tileset.png is 32x8: a row of four 8x8 tiles.
const TILE_SIZE = 8;

afterEach(endGame);

function startWithTileMap(grid: Grid<number>) {
  let tileMap!: ReturnType<typeof TileMap>;
  let image!: ReturnType<typeof Image>;
  let sheet!: ReturnType<typeof SpriteSheet>;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      sheet = useNewComponent(() =>
        SpriteSheet({
          url: tilesetUrl,
          tileWidth: TILE_SIZE,
          tileHeight: TILE_SIZE,
        })
      );
      tileMap = useNewComponent(() => TileMap(sheet, grid));
      image = useNewComponent(() => Image({ url: tilesetUrl }));
    });
  });

  return { tileMap, image, sheet };
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

function gridOf(values: Array<number>, rows: number, columns: number) {
  const grid = new Grid(rows, columns, 0);
  grid.setData(values);
  return grid;
}

test("every cell is drawn at its own place in the map", async () => {
  const { tileMap, image } = startWithTileMap(gridOf([0, 1, 2, 3], 2, 2));
  await image.load();

  const drawn = blankContext(TILE_SIZE * 2, TILE_SIZE * 2);
  tileMap.draw(drawn);

  const expected = blankContext(TILE_SIZE * 2, TILE_SIZE * 2);
  const place = (tileIndex: number, column: number, row: number) => {
    expected.drawImage(
      image.data!,
      tileIndex * TILE_SIZE,
      0,
      TILE_SIZE,
      TILE_SIZE,
      column * TILE_SIZE,
      row * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );
  };
  place(0, 0, 0);
  place(1, 1, 0);
  place(2, 0, 1);
  place(3, 1, 1);

  expect(pixels(drawn)).toEqual(pixels(expected));
});

test("a cell holding -1 is skipped", async () => {
  const { tileMap, image } = startWithTileMap(gridOf([-1, 1], 2, 1));
  await image.load();

  const drawn = blankContext(TILE_SIZE * 2, TILE_SIZE);
  tileMap.draw(drawn);

  const expected = blankContext(TILE_SIZE * 2, TILE_SIZE);
  expected.drawImage(
    image.data!,
    TILE_SIZE,
    0,
    TILE_SIZE,
    TILE_SIZE,
    TILE_SIZE,
    0,
    TILE_SIZE,
    TILE_SIZE
  );

  expect(pixels(drawn)).toEqual(pixels(expected));
});

test("x and y shift the whole map", async () => {
  const { tileMap, image } = startWithTileMap(gridOf([2], 1, 1));
  await image.load();

  const drawn = blankContext(TILE_SIZE * 2, TILE_SIZE * 2);
  tileMap.draw(drawn, { x: TILE_SIZE, y: TILE_SIZE });

  const expected = blankContext(TILE_SIZE * 2, TILE_SIZE * 2);
  expected.drawImage(
    image.data!,
    2 * TILE_SIZE,
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

test("drawing before the sheet has loaded puts nothing on the canvas", () => {
  // A sheet url nothing can have loaded already, since Image caches by url and
  // test order is not fixed.
  const unique = blankContext(64, TILE_SIZE);
  unique.fillStyle = "red";
  unique.fillRect(0, 0, 3, 1);

  let tileMap!: ReturnType<typeof TileMap>;
  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      const sheet = useNewComponent(() =>
        SpriteSheet({
          url: unique.canvas.toDataURL(),
          tileWidth: TILE_SIZE,
          tileHeight: TILE_SIZE,
        })
      );
      tileMap = useNewComponent(() => TileMap(sheet, gridOf([0, 1], 2, 1)));
    });
  });

  const context = blankContext(TILE_SIZE * 2, TILE_SIZE);
  const before = pixels(context);

  tileMap.draw(context);

  expect(pixels(context)).toEqual(before);
});

test("a map of nothing but -1 draws nothing", async () => {
  const { tileMap, image } = startWithTileMap(gridOf([-1, -1, -1, -1], 2, 2));
  await image.load();

  const context = blankContext(TILE_SIZE * 2, TILE_SIZE * 2);
  const before = pixels(context);

  tileMap.draw(context);

  expect(pixels(context)).toEqual(before);
});

test("changing the grid changes what is drawn on the next draw", async () => {
  const grid = gridOf([0], 1, 1);
  const { tileMap, image } = startWithTileMap(grid);
  await image.load();

  const first = blankContext(TILE_SIZE, TILE_SIZE);
  tileMap.draw(first);

  grid.set(0, 0, 3);

  const second = blankContext(TILE_SIZE, TILE_SIZE);
  tileMap.draw(second);

  expect(pixels(first)).not.toEqual(pixels(second));
});
