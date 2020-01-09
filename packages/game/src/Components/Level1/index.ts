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
} from "@hex-engine/2d";
import { makeTaggedUnion } from "safety-match";
import Button from "game/src/Components/Button";
import Balloon from "game/src/Components/Balloon";
import Tower from "game/src/Components/Tower";
import useGameFont from "game/src/Hooks/useGameFont";

import level1Xml from "./level1.xml";

export default function Level1() {
  useType(Level1);

  const position = useNewComponent(() => Position(new Vec2(25, 25)));
  const map = useNewComponent(() => Tiled.Map(level1Xml));

  const GameState = makeTaggedUnion({
    PLACING: (nextWave: number) => ({ nextWave }),
    RUNNING: (wave: number) => ({ wave }),
  });

  const state = GameState.PLACING(1);

  const mouse = useNewComponent(Mouse);

  let mouseDown = false;
  mouse.onMouseDown((pos) => {
    mouseDown = true;
    const localPos = position.getLocalPosition(pos);
  });
  mouse.onMouseUp(() => {
    mouseDown = false;
  });

  const start = useChild(() =>
    Button({
      position: (size) => new Vec2(map.sizeInPixels.x - size.x, 0),
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
}
