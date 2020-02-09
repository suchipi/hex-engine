import {
  useType,
  useNewComponent,
  Entity,
  useChild,
  useEntityName,
} from "@hex-engine/core";
import Geometry from "./Geometry";
import Image from "./Image";
import SpriteSheet from "./SpriteSheet";
import TileMap from "./TileMap";
import { Grid, Vector, Polygon } from "../Models";
import { useDraw } from "../Hooks";

type OgmoEntityData = {
  name: string;
  id: number;
  _eid: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  originX?: number;
  originY?: number;
  rotation?: number;
  flippedX?: boolean;
  flippedY?: boolean;
  values?: { [key: string]: any };
};

type OgmoDecalData = {
  x: number;
  y: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  texture: string;
  values?: { [key: string]: any };
};

type OgmoTileset = {
  label: string;
  path: string;
  tileSize: Vector;
  tileSeparation: Vector;
};

type OgmoProjectTileLayer = {
  definition: "tile";
  name: string;
  gridSize: Vector;
  exportID: string;
  exportMode: number;
  arrayMode: number;
  defaultTileset: OgmoTileset;
};

type OgmoProjectGridLayer = {
  definition: "grid";
  name: string;
  gridSize: Vector;
  exportID: string;
  arrayMode: number;
  legend: {
    [cellData: string]: string;
  };
};

type OgmoProjectEntityLayer = {
  definition: "entity";
  name: string;
  gridSize: Vector;
  exportID: string;
  requiredTags: Array<string>;
  excludedTags: Array<string>;
};

type OgmoProjectDecalLayer = {
  definition: "decal";
  name: string;
  gridSize: Vector;
  exportID: string;
  includeImageSequence: boolean;
  scaleable: boolean;
  rotatable: boolean;
  values: Array<any>;
};

type OgmoProjectLayer =
  | OgmoProjectTileLayer
  | OgmoProjectGridLayer
  | OgmoProjectEntityLayer
  | OgmoProjectDecalLayer;

type OgmoProject = {
  createEntity: (data: OgmoEntityData) => Entity;
  createDecal: (data: OgmoDecalData) => Entity;
  tilesets: Array<OgmoTileset>;
  layers: Array<OgmoProjectLayer>;
};

function OgmoDecal(decalData: OgmoDecalData) {
  useType(OgmoDecal);

  const geometry = useNewComponent(() =>
    Geometry({
      shape: Polygon.rectangle(1, 1),
      position: new Vector(decalData.x, decalData.y),
      // Note: looks like at time of writing, decal rotation is always in radians,
      // regardless of the angle export setting of the project
      rotation: decalData.rotation,
      scale: new Vector(decalData.scaleX ?? 1, decalData.scaleY ?? 1),
    })
  );

  const image = useNewComponent(() => Image({ url: decalData.texture }));

  image.load().then(() => {
    const { data } = image;
    if (!data) return;
    const { width, height } = data;
    if (!width || !height) return;

    geometry.shape = Polygon.rectangle(width, height);
  });

  useDraw((context) => {
    image.draw(context, { x: 0, y: 0 });
  });
}

Object.defineProperty(OgmoDecal, "name", { value: "Ogmo.Decal" });

type OgmoLevelLayer =
  | {
      definition: "tile";
      projectLayer: OgmoProjectTileLayer;
      data: Grid<number>;
    }
  | {
      definition: "grid";
      projectLayer: OgmoProjectGridLayer;
      grid: Grid<string>;
    }
  | {
      definition: "entity";
      projectLayer: OgmoProjectEntityLayer;
      entities: Array<OgmoEntityData>;
    }
  | {
      definition: "decal";
      projectLayer: OgmoProjectDecalLayer;
      decals: Array<OgmoDecalData>;
    };

type OgmoLevelApi = {
  size: Vector;
  offset: Vector;
  values: { [key: string]: any };
  layers: Array<OgmoLevelLayer>;
};

function OgmoLevel(project: OgmoProject, levelData: any): OgmoLevelApi {
  useType(OgmoLevel);

  const layers: Array<OgmoLevelLayer> = (levelData.layers as Array<any>).map(
    (layer, index) => {
      const projectLayer = project.layers.find(
        (projectLayer) => projectLayer.exportID === layer._eid
      );
      if (!projectLayer) {
        throw new Error(
          `Ogmo level layer ${index} referenced non-existent project layer with exportID ${layer._eid}`
        );
      }

      switch (projectLayer.definition) {
        case "tile": {
          const grid = new Grid<number>(layer.gridCellsX, layer.gridCellsY, 0);
          grid.setData(layer.data);
          return {
            definition: "tile",
            projectLayer,
            data: grid,
          };
        }
        case "grid": {
          const grid = new Grid<string>(layer.gridCellsX, layer.gridCellsY, "");
          grid.setData(layer.grid);
          return {
            definition: "grid",
            projectLayer,
            grid,
          };
        }
        case "entity": {
          return {
            definition: "entity",
            projectLayer,
            entities: layer.entities,
          };
        }
        case "decal": {
          return {
            definition: "decal",
            projectLayer,
            decals: layer.decals,
          };
        }
      }
    }
  );

  layers.forEach((layer) => {
    useChild(() => {
      useEntityName(layer.projectLayer.name);

      switch (layer.definition) {
        case "tile": {
          const tileset = layer.projectLayer.defaultTileset;

          const spriteSheet = useNewComponent(() =>
            SpriteSheet({
              url: tileset.path,
              tileWidth: tileset.tileSize.x,
              tileHeight: tileset.tileSize.y,
            })
          );

          const tilemap = useNewComponent(() =>
            TileMap(spriteSheet, layer.data)
          );

          useDraw((context) => {
            tilemap.draw(context);
          });

          break;
        }
        case "grid": {
          // Nothing to draw
          break;
        }
        case "entity": {
          layer.entities.forEach((entData) => {
            project.createEntity({
              ...entData,
              // Note: looks like at time of writing, entity rotation is always in degrees,
              // regardless of the angle export setting of the project
              rotation: entData.rotation
                ? entData.rotation * (Math.PI / 180)
                : 0,
            });
          });
          break;
        }
        case "decal": {
          layer.decals.forEach((decalData) => {
            project.createDecal(decalData);
          });
        }
      }
    });
  });

  return {
    size: new Vector(levelData.width, levelData.height),
    offset: new Vector(levelData.offsetX, levelData.offsetY),
    values: levelData.values,
    layers,
  };
}

Object.defineProperty(OgmoLevel, "name", { value: "Ogmo.Level" });

function defaultDecalFactory(decalData: OgmoDecalData): Entity {
  return useChild(() => OgmoDecal(decalData));
}

/**
 * A Component that provides an interface for working with an Ogmo Editor project.
 *
 * @param projectData The imported *.ogmo file
 * @param entityFactories An object map of functions that will be used to
 * construct entities in Ogmo levels, by name; for example: { player: (entData) => useChild(() => Player(entData)) }
 * @param decalFactory An optional function that will be called to construct entities for decals. The default implementation uses Ogmo.Decal.
 */
function OgmoProject(
  projectData: any,
  entityFactories: {
    [name: string]: (entityData: OgmoEntityData) => Entity;
  } = {},
  decalFactory?: (decalData: OgmoDecalData) => Entity
) {
  useType(OgmoProject);

  const project: OgmoProject = {
    createEntity: (data: OgmoEntityData) => {
      const factoryForName = entityFactories[data.name];
      if (factoryForName) {
        return factoryForName(data);
      } else {
        throw new Error(`No Ogmo entity factory defined for: ${data.name}`);
      }
    },
    createDecal: decalFactory || defaultDecalFactory,
    tilesets: [],
    layers: [],
  };

  project.tilesets = (projectData.tilesets as Array<any>).map(
    (tileset: any) => ({
      label: tileset.label,
      path: tileset.path,
      tileSize: new Vector(tileset.tileWidth, tileset.tileHeight),
      tileSeparation: new Vector(
        tileset.tileSeparationX,
        tileset.tileSeparationY
      ),
    })
  );

  project.layers = (projectData.layers as Array<any>).map(
    (layer: any, index: number) => {
      switch (layer.definition) {
        case "tile": {
          const tileset = project.tilesets.find(
            (tileset) => tileset.label === layer.defaultTileset
          );
          if (!tileset) {
            throw new Error(
              `Ogmo layer ${index} referenced non-existent default tileset: '${layer.defaultTileset}'`
            );
          }

          return {
            ...layer,
            gridSize: Vector.from(layer.gridSize),
            defaultTileset: tileset,
          };
        }
        case "grid":
        case "entity":
        case "decal": {
          return {
            ...layer,
            gridSize: Vector.from(layer.gridSize),
          };
        }
      }
    }
  );

  return {
    tilesets: project.tilesets,
    layers: project.layers,
    loadLevel(levelData: any) {
      return useNewComponent(() => OgmoLevel(project, levelData));
    },
  };
}
Object.defineProperty(OgmoProject, "name", { value: "Ogmo.Project" });

const Ogmo = {
  Project: OgmoProject,
  Level: OgmoLevel,
  Decal: OgmoDecal,
};

export default Ogmo;
