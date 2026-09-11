/// <reference types="@test-it/core/globals" />
import { Entity, useChild, useNewComponent, useType } from "@hex-engine/core";
import * as Ogmo from "./Ogmo";
import Geometry from "./Geometry";
import { Grid, Vector } from "../Models";
import { endGame, startGame, xy } from "./inputTestSetup";
import projectData from "../__fixtures__/project.ogmo";
import levelData from "../__fixtures__/level.json";

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

type EntityFactories = {
  [name: string]: (info: Ogmo.EntityFactoryInfo) => Entity;
};

/**
 * Builds a Project, and optionally a Level from it. Both useLevel and the
 * factories it calls are hooks, so all of this has to happen inside the
 * Component rather than from the test body.
 */
function startWithProject({
  project: projectSource = projectData,
  level: levelSource = null,
  entityFactories = {},
}: {
  project?: any;
  level?: any;
  entityFactories?: EntityFactories;
} = {}) {
  let project!: ReturnType<typeof Ogmo.Project>;
  let level: null | Ogmo.LevelAPI = null;
  let entity!: Entity;

  startGame(() => {
    entity = useChild(function Subject() {
      useType(Subject);

      project = useNewComponent(() =>
        // A decal factory that builds nothing, so that decals loading images
        // over the network stay out of these tests.
        Ogmo.Project(projectSource, entityFactories, () =>
          useChild(function NoDecal() {
            useType(NoDecal);
          })
        )
      );

      if (levelSource) {
        level = project.useLevel(levelSource);
      }
    });
  });

  return { project, level: level as unknown as Ogmo.LevelAPI, entity };
}

/** The name of an entity that actually appears in the fixture level. */
function firstEntityNameInLevel(): string {
  const layer = levelData.layers.find(
    (candidate: any) =>
      Array.isArray(candidate.entities) && candidate.entities.length > 0
  );
  return layer.entities[0].name;
}

test("the loader hands over the parsed project and level", () => {
  expect(Array.isArray(projectData.layers)).toBe(true);
  expect(Array.isArray(levelData.layers)).toBe(true);
  expect(typeof levelData.width).toBe("number");
});

test("a Project exposes the tilesets from the ogmo file", () => {
  const { project } = startWithProject();

  expect(project.tilesets.length).toBeGreaterThan(0);

  for (const tileset of project.tilesets) {
    expect(typeof tileset.label).toBe("string");
    expect(typeof tileset.path).toBe("string");
    expect(tileset.tileSize).toBeInstanceOf(Vector);
  }
});

test("a Project exposes the layer definitions, with their grid sizes as Vectors", () => {
  const { project } = startWithProject();

  expect(project.layers.length).toBe(projectData.layers.length);

  for (const layer of project.layers) {
    expect(layer.gridSize).toBeInstanceOf(Vector);
  }
});

test("a tile layer definition is linked to its default tileset", () => {
  const { project } = startWithProject();

  const tileLayers = project.layers.filter(
    (layer) => layer.definition === "tile"
  );
  expect(tileLayers.length).toBeGreaterThan(0);

  for (const layer of tileLayers) {
    expect(project.tilesets).toContain(
      (layer as Ogmo.ProjectTileLayer).defaultTileset
    );
  }
});

test("useLevel builds a Level with the level's size and offset", () => {
  const { level } = startWithProject({ level: levelData });

  expect(xy(level.size)).toEqual({ x: levelData.width, y: levelData.height });
  expect(xy(level.offset)).toEqual({
    x: levelData.offsetX,
    y: levelData.offsetY,
  });
});

test("a Level's layers come back in reverse order, so the first draws on top", () => {
  const { level } = startWithProject({ level: levelData });

  expect(level.layers.length).toBe(levelData.layers.length);

  const levelLayerNames = levelData.layers.map((layer: any) => layer.name);
  const parsedLayerNames = level.layers.map(
    (layer) => (layer.projectLayer as { name: string }).name
  );

  expect(parsedLayerNames).toEqual([...levelLayerNames].reverse());
});

test("a tile layer's data is turned into a Grid of tile indices", () => {
  const { level } = startWithProject({ level: levelData });

  const tileLayers = level.layers.filter(
    (layer) => layer.definition === "tile"
  ) as Array<Ogmo.LevelTileLayer>;
  expect(tileLayers.length).toBeGreaterThan(0);

  for (const layer of tileLayers) {
    expect(layer.data).toBeInstanceOf(Grid);

    const source = levelData.layers.find(
      (raw: any) => raw._eid === layer.projectLayer.exportID
    );
    expect(layer.data.size.x).toBe(source.gridCellsX);
    expect(layer.data.size.y).toBe(source.gridCellsY);
    expect(layer.data.get(0, 0)).toBe(source.data[0]);
  }
});

test("a grid layer's data is turned into a Grid of strings", () => {
  const { level } = startWithProject({ level: levelData });

  const gridLayers = level.layers.filter(
    (layer) => layer.definition === "grid"
  ) as Array<Ogmo.LevelGridLayer>;

  for (const layer of gridLayers) {
    expect(layer.grid).toBeInstanceOf(Grid);
    expect(typeof layer.grid.get(0, 0)).toBe("string");
  }
});

test("entity factories are called for the entities in the level", () => {
  const built: Array<string> = [];
  const name = firstEntityNameInLevel();

  startWithProject({
    level: levelData,
    entityFactories: {
      [name]: (info) => {
        built.push(info.data.name);
        return useChild(function BuiltEntity() {
          useType(BuiltEntity);
          useNewComponent(() => Geometry(info));
        });
      },
    },
  });

  expect(built.length).toBeGreaterThan(0);
  for (const entry of built) {
    expect(entry).toBe(name);
  }
});

test("an entity factory receives everything Geometry needs", () => {
  let seen: null | Ogmo.EntityFactoryInfo = null;
  const name = firstEntityNameInLevel();

  startWithProject({
    level: levelData,
    entityFactories: {
      [name]: (info) => {
        seen = seen || info;
        return useChild(function BuiltEntity() {
          useType(BuiltEntity);
        });
      },
    },
  });

  const info = seen as unknown as Ogmo.EntityFactoryInfo;
  expect(info.shape).not.toBe(undefined);
  expect(info.position).toBeInstanceOf(Vector);
  expect(typeof info.rotation).toBe("number");
  expect(info.scale).toBeInstanceOf(Vector);
  expect(info.data.name).toBe(name);
});

test("an entity with no registered factory is reported, not quietly skipped", () => {
  const { level } = startWithProject({
    level: levelData,
    entityFactories: {},
  });

  // The layers still parse; it is the entity layer's contents that complain.
  expect(level.layers.length).toBe(levelData.layers.length);

  expect(logged.length).toBeGreaterThan(0);
  expect(String((logged[0] as Error).message)).toContain(
    "No Ogmo entity factory defined for"
  );
});

test("a level referencing a layer the project does not have is reported", () => {
  const brokenLevel = {
    ...levelData,
    layers: [{ ...levelData.layers[0], _eid: "not-a-real-layer" }],
  };

  startWithProject({ level: brokenLevel });

  expect(logged.length).toBe(1);
  expect(String((logged[0] as Error).message)).toContain(
    "non-existent project layer"
  );
});

test("a project referencing a tileset it does not have is reported", () => {
  const brokenProject = {
    ...projectData,
    layers: projectData.layers.map((layer: any) =>
      layer.definition === "tile"
        ? { ...layer, defaultTileset: "not-a-real-tileset" }
        : layer
    ),
  };

  startWithProject({ project: brokenProject });

  expect(logged.length).toBe(1);
  expect(String((logged[0] as Error).message)).toContain(
    "non-existent default tileset"
  );
});
