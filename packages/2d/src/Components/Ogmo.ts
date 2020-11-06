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

/**
 * The data that describes an entity inside of an Ogmo level.
 * This shape comes directly from the level json.
 */
export type EntityData = {
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

/**
 * The data that describes a decal inside of an Ogmo level.
 * This shape comes directly from the level json.
 */
export type DecalData = {
  x: number;
  y: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  texture: string;
  values?: { [key: string]: any };
};

export type Tileset = {
  label: string;
  path: string;
  tileSize: Vector;
  tileSeparation: Vector;
};

export type ProjectTileLayer = {
  definition: "tile";
  name: string;
  gridSize: Vector;
  exportID: string;
  exportMode: number;
  arrayMode: number;
  defaultTileset: Tileset;
};

export type ProjectGridLayer = {
  definition: "grid";
  name: string;
  gridSize: Vector;
  exportID: string;
  arrayMode: number;
  legend: {
    [cellData: string]: string;
  };
};

export type ProjectEntityLayer = {
  definition: "entity";
  name: string;
  gridSize: Vector;
  exportID: string;
  requiredTags: Array<string>;
  excludedTags: Array<string>;
};

export type ProjectDecalLayer = {
  definition: "decal";
  name: string;
  gridSize: Vector;
  exportID: string;
  includeImageSequence: boolean;
  scaleable: boolean;
  rotatable: boolean;
  values: Array<any>;
};

export type ProjectLayer =
  | ProjectTileLayer
  | ProjectGridLayer
  | ProjectEntityLayer
  | ProjectDecalLayer;

export type ProjectAPI = {
  createEntity: (data: EntityData) => Entity;
  createDecal: (data: DecalData) => Entity;
  tilesets: Array<Tileset>;
  layers: Array<ProjectLayer>;
};

/**
 * The default Ogmo decal component, used in the creation of decal entities
 * when rendering the decal layer of an ogmo level.
 *
 * It loads the image for the decal, and draws it with the position, rotation,
 * and scale specified by the decal data in the level.
 *
 * If you want to use a different component to render decals, instead of this
 * one, then you can override it when you create the Ogmo.Project by passing
 * a custom function as its `decalFactory` parameter.
 */
function Decal(decalData: DecalData) {
  useType(Decal);

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

Object.defineProperty(Decal, "name", { value: "Ogmo.Decal" });

export type LevelTileLayer = {
  definition: "tile";
  projectLayer: ProjectTileLayer;
  data: Grid<number>;
};

export type LevelGridLayer = {
  definition: "grid";
  projectLayer: ProjectGridLayer;
  grid: Grid<string>;
};

export type LevelEntityLayer = {
  definition: "entity";
  projectLayer: ProjectEntityLayer;
  entities: Array<EntityData>;
};

export type LevelDecalLayer = {
  definition: "decal";
  projectLayer: ProjectDecalLayer;
  decals: Array<DecalData>;
};

export type LevelLayer =
  | LevelTileLayer
  | LevelGridLayer
  | LevelEntityLayer
  | LevelDecalLayer;

export type LevelAPI = {
  /** The size of the level, in pixels. */
  size: Vector;

  /** The render offset for the level. */
  offset: Vector;

  /** Any custom values that were placed on the level from the Ogmo editor. */
  values: { [key: string]: any };

  /** An array of the layers in the level. */
  layers: Array<LevelLayer>;
};

/**
 * A component that creates a TileMap component for a tile layer from
 * an Ogmo level.
 *
 * This component is used by Ogmo.TileRenderer which is the default
 * implementation for rendering tile layers from Ogmo levels. You may find
 * Ogmo.TileLayerParser useful if you are overriding the default TileRenderer
 * with a different implementation. To override it, pass a component function
 * to `useLevel` as its `tileRenderer` parameter.
 */
export function TileLayerParser(layer: LevelTileLayer) {
  useType(TileLayerParser);

  const tileset = layer.projectLayer.defaultTileset;

  const spriteSheet = useNewComponent(() =>
    SpriteSheet({
      url: tileset.path,
      tileWidth: tileset.tileSize.x,
      tileHeight: tileset.tileSize.y,
    })
  );

  const tilemap = useNewComponent(() => TileMap(spriteSheet, layer.data));

  return {
    tilemap,
  };
}
Object.defineProperty(TileLayerParser, "name", {
  value: "Ogmo.TileLayerParser",
});

/**
 * The default tile renderer implementation used when loading level data with
 * Ogmo.Project's useLevel method. You can pass an additional argument to
 * useLevel to use a different component. If you do, you may wish to use
 * Ogmo.TileLayerParser like this component does.
 */
export function TileRenderer(layer: LevelTileLayer, levelData: any) {
  useType(TileRenderer);

  const { tilemap } = useNewComponent(() => TileLayerParser(layer));

  const sizeInPixels = new Vector(levelData.width, levelData.height);
  useDraw((context) => {
    context.translate(-sizeInPixels.x / 2, -sizeInPixels.y / 2);
    tilemap.draw(context);
  });
}
Object.defineProperty(TileRenderer, "name", { value: "Ogmo.TileRenderer" });

/**
 * A component representing a single Ogmo level. When created, it will loop over all the
 * layers, decals, tiles, entities, and grids in the level, and create appropriate objects
 * to represent each.
 *
 * It cooperates with an Ogmo.Project component to get layer information and create entities
 * and decals.
 *
 * You cannot create these manually; instead, use the `useLevel` method on Ogmo.Project.
 */
function Level(
  project: ProjectAPI,
  levelData: any,
  tileRenderer: (layer: LevelTileLayer, levelData: any) => any
): LevelAPI {
  useType(Level);

  const layers: Array<LevelLayer> = (levelData.layers as Array<any>).map(
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
          useNewComponent(() => tileRenderer(layer, levelData));
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

Object.defineProperty(Level, "name", { value: "Ogmo.Level" });

function defaultDecalFactory(decalData: DecalData): Entity {
  return useChild(() => Decal(decalData));
}

/**
 * A Component that provides an interface for working with an [Ogmo Editor](https://ogmo-editor-3.github.io/) project.
 *
 * @param projectData The imported *.ogmo file
 * @param entityFactories An object map of functions that will be used to
 * construct entities in Ogmo levels, by name; for example: { player: (entData) => useChild(() => Player(entData)) }
 * @param decalFactory An optional function that will be called to construct entities for decals. The default implementation uses Ogmo.Decal.
 */
function Project(
  projectData: any,
  entityFactories: {
    [name: string]: (entityData: EntityData) => Entity;
  } = {},
  decalFactory?: (decalData: DecalData) => Entity
) {
  useType(Project);

  const project: ProjectAPI = {
    createEntity: (data: EntityData) => {
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
    /**
     * All of the tilesets specified in the Ogmo project.
     */
    tilesets: project.tilesets,

    /**
     * All of the layer definitions specified in the Ogmo project.
     */
    layers: project.layers,

    /**
     * Create a new OgmoLevel component for the given level data,
     * and add it to the current component's Entity.
     *
     * ```ts
     * import levelData from "./level.json";
     * ogmo.useLevel(levelData);
     * ```
     *
     * You may pass a component function as the second argument
     * to override the component used to render the level's tile
     * layers. By default, Ogmo.TileRenderer is used.
     */
    useLevel(
      levelData: any,
      tileRenderer: (
        layer: LevelTileLayer,
        levelData: any
      ) => any = TileRenderer
    ) {
      return useNewComponent(() => Level(project, levelData, tileRenderer));
    },
  };
}
Object.defineProperty(Project, "name", { value: "Ogmo.Project" });

export { Project, Level, Decal };
