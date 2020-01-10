import {
  useNewComponent,
  Position,
  Vec2,
  useDraw,
  Tiled,
  useType,
  useChild,
  Mouse,
  Label,
  Grid,
  Entity,
  useEntityName,
} from "@hex-engine/2d";
import { makeTaggedUnion } from "safety-match";
import Button from "game/src/Components/Button";
import Balloon from "game/src/Components/Balloon";
import Tower from "game/src/Components/Tower";
import useGameFont from "game/src/Hooks/useGameFont";

import level1Xml from "./level1.xml";

export default function Level1() {
  useType(Level1);

  useNewComponent(() => Position(new Vec2(25, 25)));
  const map = useNewComponent(() => Tiled.Map(level1Xml));

  const GameState = makeTaggedUnion({
    PLACING: (nextWave: number) => ({ nextWave }),
    RUNNING: (wave: number) => ({ wave }),
  });

  const state = GameState.PLACING(1);

  // TODO: Grid constructor and methods should allow Vec2 inputs
  const towersGrid = new Grid<null | Entity>(
    map.sizeInTiles.x,
    map.sizeInTiles.y,
    null
  );

  const mouse = useNewComponent(() => Mouse({ bounds: map.sizeInPixels }));

  const tileHighlight = useChild(() => {
    useEntityName("Tile Highlight");
    const position = useNewComponent(Position);

    const state = {
      position,
    };

    useDraw((context) => {
      if (mouse.isHovering) {
        context.fillStyle = "rgba(255, 255, 255, 0.5)";
        context.fillRect(0, 0, map.tileSize.x, map.tileSize.y);
      }
    });

    return state;
  });

  mouse.onMove((localPos) => {
    state.match({
      PLACING: () => {
        const pos = localPos
          .dividedBy(map.tileSize)
          .roundDown()
          .times(map.tileSize);
        tileHighlight.api.position.replace(pos);
      },
      _: () => {},
    });
  });

  mouse.onClick((localPos) => {
    state.match({
      PLACING: () => {
        const tilePos = localPos.dividedBy(map.tileSize).roundDown();
        if (!towersGrid.get(tilePos.x, tilePos.y)) {
          towersGrid.set(
            tilePos.x,
            tilePos.y,
            useChild(() => Tower({ position: tilePos.times(map.tileSize) }))
          );
        }
      },
      _: () => {},
    });
  });

  useChild(() =>
    Button({
      calcPosition: (size) =>
        new Vec2(map.sizeInPixels.x - size.x, -size.y - 1),
      text: "Start!",
      onClick: () => {
        alert("do something");
      },
    })
  );

  const waveLabel = useNewComponent(() =>
    Label({
      text: "Wave 0",
      font: useGameFont(),
    })
  );

  useDraw((context) => {
    map.tileMaps.forEach((tilemap) => {
      tilemap.drawMapIntoContext({ context });
    });

    waveLabel.drawLabel({ context });
  });

  return {
    towersGrid,
  };
}
