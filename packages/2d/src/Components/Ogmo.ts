import {
  useType,
  useNewComponent,
  Entity,
  useChild,
  useEntityName,
  useCallbackAsCurrent,
} from "@hex-engine/core";
import Geometry from "./Geometry";
import Image from "./Image";
import SpriteSheet from "./SpriteSheet";
import TileMap from "./TileMap";
import { Grid, Vector, Polygon, Shape } from "../Models";
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
  createEntity: (data: EntityData, levelSizeInPixels: Vector) => Entity;
  createDecal: (data: DecalData, levelSizeInPixels: Vector) => Entity;
  tilesets: Array<Tileset>;
  layers: Array<ProjectLayer>;
};

/** Metadata concerning an entity as defined in the project's .ogmo file. */
export type EntityProjectData = {
  exportID: string;
  name: string;
  limit: number;
  size: { x: number; y: number };
  origin: { x: number; y: number };
  originAnchored: boolean;
  shape: {
    label: string;
    points: Array<{ x: number; y: number }>;
  };
  color: string;
  tileX: boolean;
  tileY: boolean;
  tileSize: { x: number; y: number };
  resizeableX: boolean;
  resizeableY: boolean;
  rotatable: boolean;
  rotationDegrees: number; // in degrees
  canFlipX: boolean;
  canFlipY: boolean;
  canSetColor: boolean;
  hasNodes: boolean;
  nodeLimit: number;
  nodeDisplay: number;
  nodeGhost: boolean;
  tags: Array<string>;
  values: Array<{
    name: string;
    definition: string;
    defaults: any;
  }>;
  texture: string; // filepath
  textureImage: string; // data URL
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
function Decal({ geometryPromise, image }: DecalFactoryInfo) {
  useType(Decal);

  let loaded = false;
  geometryPromise.then(
    useCallbackAsCurrent((geomInit) => {
      useNewComponent(() => Geometry(geomInit));
      loaded = true;
    })
  );

  useDraw((context) => {
    if (!loaded) return;

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
export function TileRenderer(layer: LevelTileLayer, _levelData: any) {
  useType(TileRenderer);

  const { tilemap } = useNewComponent(() => TileLayerParser(layer));

  useDraw((context) => {
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

  const layers: Array<LevelLayer> = [...(levelData.layers as Array<any>)]
    .reverse()
    .map((layer, index) => {
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
    });

  const levelSizeInPixels = new Vector(levelData.width, levelData.height);

  layers.forEach((layer) => {
    useChild(() => {
      useEntityName(layer.projectLayer.name);

      const geometry = useNewComponent(() =>
        Geometry({
          shape: Polygon.rectangle(levelSizeInPixels),
        })
      );

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
            project.createEntity(entData, levelSizeInPixels);
          });
          break;
        }
        case "decal": {
          layer.decals.forEach((decalData) => {
            project.createDecal(decalData, levelSizeInPixels);
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

function defaultDecalFactory(info: DecalFactoryInfo): Entity {
  return useChild(() => Decal(info));
}

/**
 * The object passed to an entity factory function as passed into Ogmo.Project.
 *
 * Generally, all you'll do with this is pass it into the geometry constructor:
 * ```ts
 * // Given that `info` is an `Ogmo.EntityFactoryInfo`:
 * useNewComponent(() => Geometry(info));
 * ```
 *
 * However, if you use Ogmo's "custom values" feature, then you can find your values and their defaults in the `data` and `projectData` properties.
 *
 * @property `shape` - A `Shape` derived from the size of the entity in the level json or ogmo project, suitable for passing into the `Geometry` component.
 * @property `position` - A position `Vector` derived from the position of the entity in the level json, suitable for passing into the `Geometry` component.
 * @property `rotation` - The rotation (in radians) derived from the rotation of the entity in the level json, suitable for passing into the `Geometry` component.
 * @property `scale` - The X and Y scale components of derived from the scale of the entity in the level json, suitable for passing into the `Geometry` component.
 * @property `data` - The raw data object for this entity as found in the level json. Note that positions, rotations, sizes, and etc in this object are not normalized into Hex Engine's coordinate system.
 * @property `projectData` - The raw metadata object for this entity as found in the ogmo project. Note that positions, rotations, sizes, and etc in this object are not normalized into Hex Engine's coordinate system.
 */
export type EntityFactoryInfo = {
  shape: Shape;
  position: Vector;
  rotation: number;
  scale: Vector;
  data: EntityData;
  projectData: EntityProjectData;
};

/**
 * The object passed to a decal factory function (as optionally passed into Ogmo.Project).
 *
 * Generally, all you'll do with this is pass the result of the `geometryPromise` into the geometry constructor:
 * ```ts
 * // Given that `info` is an `Ogmo.DecalFactoryInfo`:
 * info.geometryPromise.then(
 *   useCallbackAsCurrent(
 *     (result) => useNewComponent(() => Geometry(result))
 *   )
 * );
 * ```
 *
 * @property `geometryPromise` - A `Promise` that resolves into an object with `shape`, `position`, `rotation`, and `scale` properties, suitable for passing into the `Geometry` component.
 * @property `image` - The `Image` component for the underlying image this decal uses.
 * @property `data` - The raw data object for this decal as found in the level JSON. Note that positions, rotations, sizes, and etc in this object are not normalized into Hex Engine's coordinate system.
 */
export type DecalFactoryInfo = {
  geometryPromise: Promise<{
    shape: Shape;
    position: Vector;
    rotation: number;
    scale: Vector;
  }>;
  image: ReturnType<typeof Image>;
  data: DecalData;
};

/**
 * A Component that provides an interface for working with an [Ogmo Editor](https://ogmo-editor-3.github.io/) project.
 *
 * @param projectData The imported *.ogmo file
 * @param entityFactories An object map of functions that will be used to
 * construct entities in Ogmo levels, by name; for example: `{ player: (info) => useChild(() => Player(info)) }`. The type of the `info` parameter is a superset of the type required by the `Geometry` component, so you can pass it in directly to set up the entity's geometry.
 * @param decalFactory An optional function that will be called to construct entities for decals. The default implementation uses Ogmo.Decal.
 */
function Project(
  projectData: any,
  entityFactories: {
    [name: string]: (info: EntityFactoryInfo) => Entity;
  } = {},
  decalFactory: (info: DecalFactoryInfo) => Entity = defaultDecalFactory
) {
  useType(Project);

  const project: ProjectAPI = {
    createEntity: (entData: EntityData, levelSizeInPixels: Vector) => {
      const factoryForName = entityFactories[entData.name];
      if (factoryForName) {
        const entProjectData: EntityProjectData | undefined = (
          projectData.entities || []
        ).find((info: EntityProjectData) => info.name === entData.name);

        const size = new Vector(
          entData.width ?? entProjectData?.size?.x ?? 0,
          entData.height ?? entProjectData?.size?.y ?? 0
        );

        const position = new Vector(entData.x, entData.y)
          .subtractMutate(levelSizeInPixels.divide(2))
          .addMutate(size.divide(2));

        if (
          entProjectData?.origin &&
          entProjectData?.origin?.x &&
          entProjectData?.origin?.y
        ) {
          position.subtractXMutate(entProjectData.origin.x);
          position.subtractYMutate(entProjectData.origin.y);
        }

        // Note: looks like at time of writing, entity rotation is always in degrees,
        // regardless of the angle export setting of the project
        const rotation = entData.rotation
          ? entData.rotation * (Math.PI / 180)
          : 0;
        const scale = new Vector(1, 1); // TODO

        return factoryForName({
          shape: Polygon.rectangle(size), // TODO support non-rectangle
          position,
          rotation,
          scale,
          data: entData,
          projectData: entProjectData!,
        });
      } else {
        throw new Error(`No Ogmo entity factory defined for: ${entData.name}`);
      }
    },
    createDecal: (decalData: DecalData, levelSizeInPixels: Vector) => {
      const image = useNewComponent(() => Image({ url: decalData.texture }));

      const geometryPromise = image.load().then(() => {
        const { data } = image;
        if (!data) {
          return {
            shape: Polygon.rectangle(1, 1),
            position: new Vector(0, 0),
            rotation: 0,
            scale: new Vector(1, 1),
          };
        }
        const { width, height } = data;
        if (!width || !height) {
          return {
            shape: Polygon.rectangle(1, 1),
            position: new Vector(0, 0),
            rotation: 0,
            scale: new Vector(1, 1),
          };
        }

        const shape = Polygon.rectangle(width, height);
        const position = new Vector(decalData.x, decalData.y).subtractMutate(
          levelSizeInPixels.divide(2)
        );
        // Note: looks like at time of writing, decal rotation is always in radians,
        // regardless of the angle export setting of the project
        const rotation = decalData.rotation ?? 0;
        const scale = new Vector(decalData.scaleX ?? 1, decalData.scaleY ?? 1);

        return {
          shape,
          position,
          rotation,
          scale,
        };
      });

      return decalFactory({
        geometryPromise,
        image,
        data: decalData,
      });
    },
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
