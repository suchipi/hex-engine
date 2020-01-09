import { useType, useNewComponent, Component } from "@hex-engine/core";
import SpriteSheet from "./SpriteSheet";
import TileMap from "./TileMap";
import { Grid } from "../Models";

function Tileset(data: XMLSourceLoader.Element) {
  useType(Tileset);

  if (typeof data === "string" || data.tagName !== "tileset") {
    throw new Error("Invalid XML data passed to Tiled.Tileset");
  }

  const image = data.children.find(
    (child) => typeof child !== "string" && child.tagName === "image"
  );
  if (!image || typeof image === "string") {
    throw new Error(
      "XML data passed to Tiled.Tileset does not contain an image"
    );
  }

  const imageUrl = image.attributes.source;
  if (typeof imageUrl !== "string") {
    throw new Error(
      "source attribute of image in XML data passed to Tiled.Tileset is not a string"
    );
  }

  const tileWidth = data.attributes.tilewidth;
  if (typeof tileWidth !== "number") {
    throw new Error(
      "tilewidth attribute of tileset in XML data passed to Tiled.Tileset is not a number"
    );
  }

  const tileHeight = data.attributes.tileheight;
  if (typeof tileHeight !== "number") {
    throw new Error(
      "tileheight attribute of tileset in XML data passed to Tiled.Tileset is not a number"
    );
  }

  const spriteSheet = useNewComponent(() =>
    SpriteSheet({
      url: imageUrl,
      tileWidth: Number(tileWidth) || 0,
      tileHeight: Number(tileHeight) || 0,
    })
  );

  return {
    spriteSheet,
  };
}

function Layer(layer: XMLSourceLoader.Element) {
  useType(Layer);

  if (typeof layer === "string" || layer.tagName !== "layer") {
    throw new Error("Invalid XML data passed to Tiled.Layer");
  }

  const width = layer.attributes.width;
  if (typeof width !== "number") {
    throw new Error(
      "`width` attribute in XML data passed to Tiled.Layer was not a number"
    );
  }

  const height = layer.attributes.height;
  if (typeof height !== "number") {
    throw new Error(
      "`height` attribute in XML data passed to Tiled.Layer was not a number"
    );
  }

  const dataEl = layer.children.find(
    (child) => typeof child !== "string" && child.tagName === "data"
  );
  if (!dataEl || typeof dataEl === "string") {
    throw new Error(
      "`data` element not found in XML data passed to Tiled.Layer"
    );
  }

  if (dataEl.attributes.encoding !== "csv") {
    throw new Error(
      "XML layer data passed to Tiled.Layer does not use csv encoding. Only csv encoding is supported at this time."
    );
  }

  const csv = dataEl.children.join(" ");
  const numbers = csv
    .split(",")
    .map((cell) => Number(cell.trim()))
    .map((tileIndex) => tileIndex - 1);

  const grid = new Grid(width, height, 0);
  grid.setData(numbers);

  return {
    grid,
    visible: layer.attributes.visible !== 0,
  };
}

function TiledMap(data: XMLSourceLoader.Element) {
  useType(TiledMap);

  if (typeof data === "string" || data.tagName !== "map") {
    throw new Error("Invalid XML data passed to Tiled.Map");
  }

  const tilesetEl = data.children.find(
    (child) => typeof child !== "string" && child.tagName === "tileset"
  );
  if (!tilesetEl || typeof tilesetEl === "string") {
    throw new Error("tileset not found in XML data passed to Tiled.Map");
  }

  const tileset = useNewComponent(() => Tileset(tilesetEl.attributes.source));

  const layerEls = data.children.filter(
    (child) => typeof child !== "string" && child.tagName === "layer"
  );

  const layers: Array<Component & ReturnType<typeof Layer>> = [];
  for (const layerEl of layerEls) {
    layers.push(useNewComponent(() => Layer(layerEl)));
  }

  const tileMaps = layers
    .filter((layer) => layer.visible)
    .map((layer) =>
      useNewComponent(() => TileMap(tileset.spriteSheet, layer.grid))
    );

  // TODO: objectgroup

  return {
    tileset,
    tileMaps,
  };
}

Object.defineProperty(Tileset, "name", { value: "Tiled.Tileset" });
Object.defineProperty(Layer, "name", { value: "Tiled.Layer" });
Object.defineProperty(TiledMap, "name", { value: "Tiled.Map" });

const Tiled = {
  Tileset,
  Layer,
  Map: TiledMap,
};

export default Tiled;
