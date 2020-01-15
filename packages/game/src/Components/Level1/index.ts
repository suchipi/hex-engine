import {
  useNewComponent,
  Position,
  Vec2,
  useDraw,
  Tiled,
  useType,
  useChild,
  Pointer,
  Label,
  Grid,
  Entity,
  useEntityName,
  TextBox,
  Keyboard,
  useUpdate,
  Timer,
} from "@hex-engine/2d";
import { makeTaggedUnion } from "safety-match";
import Button from "../Button";
import Tower from "../Tower";
import useGameFont from "../../Hooks/useGameFont";

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

  const towersGrid = new Grid<null | Entity>(map.sizeInTiles, null);

  const pointer = useNewComponent(() => Pointer({ bounds: map.sizeInPixels }));

  const tileHighlight = useChild(() => {
    useEntityName("Tile Highlight");
    const position = useNewComponent(Position);

    const state = {
      position,
    };

    useDraw((context) => {
      if (pointer.isInsideBounds) {
        context.fillStyle = "rgba(255, 255, 255, 0.5)";
        context.fillRect(0, 0, map.tileSize.x, map.tileSize.y);
      }
    });

    return state;
  });

  pointer.onMove((localPos) => {
    state.match({
      PLACING: () => {
        const pos = localPos
          .dividedBy(map.tileSize)
          .roundDown()
          .times(map.tileSize);
        tileHighlight.api.position.mutateInto(pos);
      },
      _: () => {},
    });
  });

  pointer.onClick((localPos) => {
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
      calcPosition: (size) => new Vec2(map.sizeInPixels.x - size.x, -size.y),
      text: "Start!",
      onClick: () => {
        alert("do something");
      },
    })
  );

  const font = useGameFont();

  useChild(() => {
    useNewComponent(() => Position(new Vec2(map.sizeInPixels.x, 0)));

    const size = new Vec2(map.sizeInPixels.x, 54);
    const textBox = useNewComponent(() =>
      TextBox({
        font,
        size,
      })
    );

    const state = {
      text:
        "Stuff goes\nhere, Shyaknow. Ain't\tthat Somethin? I think it's pretty cool, myself. I mean, it's *really* cool, frankly. Like, super damn cool. Incredible, really. Really, *really* cool.",
    };

    const keyboard = useNewComponent(Keyboard);

    let unseenText = state.text;
    let done = false;
    useDraw((context) => {
      if (done) return;

      context.fillStyle = "#ddd";
      context.fillRect(0, 0, size.x, size.y);

      const { textFit, remainingText, printedLines } = textBox.drawText({
        context,
        text: state.text,
      });
      unseenText = remainingText
        ? printedLines[printedLines.length - 1] + "\n" + remainingText
        : "";

      if (!textFit) {
      }
    });

    const advanceTimer = useNewComponent(Timer);
    useUpdate(() => {
      if (advanceTimer.delta() < 0) return;

      if (unseenText && keyboard.pressed.has(" ")) {
        state.text = unseenText;
        advanceTimer.set(500);
      } else if (keyboard.pressed.has(" ")) {
        done = true;
      }
    });

    return state;
  });

  const waveLabel = useNewComponent(() =>
    Label({
      text: "Wave 0",
      font,
    })
  );

  useDraw((context) => {
    map.tileMaps.forEach((tilemap) => {
      tilemap.drawMapIntoContext({ context });
    });

    waveLabel.drawLabel({ context });
  });
}
