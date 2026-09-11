/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import * as Tiled from "./Tiled";
import SpriteSheet from "./SpriteSheet";
import { Grid, Vector } from "../Models";
import { endGame, startGame, xy } from "./inputTestSetup";
import mapData from "../__fixtures__/tiled-map.xml";

let logged: Array<unknown> = [];
let realConsoleError: typeof console.error;

beforeEach(() => {
  logged = [];
  realConsoleError = console.error;
  console.error = (...args: Array<unknown>) => {
    logged.push(args[0]);
  };
});

afterEach(() => {
  console.error = realConsoleError;
  endGame();
});

function startWithMap(data: XMLSourceLoader.Element = mapData) {
  let map!: ReturnType<typeof Tiled.Map>;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);
      map = useNewComponent(() => Tiled.Map(data));
    });
  });

  return map;
}

test("the loader hands over parsed XML", () => {
  expect(typeof mapData).toBe("object");
  expect((mapData as Exclude<typeof mapData, string>).tagName).toBe("map");
});

test("a Map builds a SpriteSheet from its embedded tileset", () => {
  const map = startWithMap();

  expect(xy(map.tileSize)).toEqual({ x: 8, y: 8 });
  expect(map.tileset.spriteSheet).not.toBe(undefined);
});

test("every layer in the file becomes a Layer", () => {
  const map = startWithMap();

  expect(map.layers.length).toBe(2);
  expect(map.layers[0].grid).toBeInstanceOf(Grid);
});

test("only the visible layers get a TileMap", () => {
  const map = startWithMap();

  expect(map.layers.map((layer) => layer.visible)).toEqual([true, false]);
  expect(map.tileMaps.length).toBe(1);
});

test("csv layer data is parsed into a Grid, with the gid offset removed", () => {
  const map = startWithMap();
  const grid = map.layers[0].grid;

  expect(xy(grid.size)).toEqual({ x: 2, y: 2 });
  // The file holds 1,2,3,4 and Tiled's gids start at 1, so the tile indices
  // come out zero-based.
  expect(grid.get(0, 0)).toBe(0);
  expect(grid.get(1, 0)).toBe(1);
  expect(grid.get(0, 1)).toBe(2);
  expect(grid.get(1, 1)).toBe(3);
});

test("the map's size is worked out from its layers and tile size", () => {
  const map = startWithMap();

  expect(xy(map.sizeInTiles)).toEqual({ x: 2, y: 2 });
  expect(xy(map.sizeInPixels)).toEqual({ x: 16, y: 16 });
});

test("objects from every object group are collected", () => {
  const map = startWithMap();

  expect(map.objects.length).toBe(2);
});

test("an object carries its id, name, location, and size", () => {
  const map = startWithMap();

  const spawn = map.objects.find(
    (object) => object.kind !== "string" && object.name === "spawn"
  );

  expect(spawn).not.toBe(undefined);
  if (!spawn || spawn.kind === "string") throw new Error("expected an object");

  expect(Number(spawn.id)).toBe(1);
  expect(spawn.location).toBeInstanceOf(Vector);
  expect(xy(spawn.location)).toEqual({ x: 16, y: 24 });
  expect(xy(spawn.size!)).toEqual({ x: 8, y: 8 });
});

test("an object with no name still comes through", () => {
  const map = startWithMap();

  const area = map.objects.find(
    (object) => object.kind !== "string" && Number(object.id) === 2
  );

  expect(area).not.toBe(undefined);
  if (!area || area.kind === "string") throw new Error("expected an object");
  expect(xy(area.location)).toEqual({ x: 0, y: 0 });
  expect(xy(area.size!)).toEqual({ x: 16, y: 16 });
});

test("a Map builds a SpriteSheet Component on its Entity", () => {
  let entity!: ReturnType<typeof useChild>;

  startGame(() => {
    entity = useChild(function Subject() {
      useType(Subject);
      useNewComponent(() => Tiled.Map(mapData));
    });
  });

  expect(entity.hasComponent(SpriteSheet)).toBe(true);
});

test("XML that is not a map is reported", () => {
  startWithMap("not a map");

  expect(logged.length).toBe(1);
  expect(String((logged[0] as Error).message)).toContain(
    "Invalid XML data passed to Tiled.Map"
  );
});

test("a map with no tileset is rejected", () => {
  const withoutTileset = {
    ...(mapData as Exclude<typeof mapData, string>),
    children: (mapData as Exclude<typeof mapData, string>).children!.filter(
      (child) => typeof child === "string" || child.tagName !== "tileset"
    ),
  };

  startWithMap(withoutTileset);

  expect(logged.length).toBe(1);
  expect(String((logged[0] as Error).message)).toContain("tileset not found");
});
