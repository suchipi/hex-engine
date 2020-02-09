import {
  Canvas,
  useNewComponent,
  useType,
  useChild,
  Ogmo,
  Vector,
  useRawDraw,
} from "@hex-engine/2d";
import FPS from "./FPS";
import Player from "./Player";
import ogmoProject from "./game.ogmo";
import ogmoLevel from "./levels/level1.json";

export default function Root() {
  useType(Root);

  const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
  canvas.setPixelated(true);
  canvas.fullscreen({ pixelZoom: 0.5 });

  useNewComponent(FPS);

  useRawDraw((context) => {
    context.scale(4, 4);
  });

  const ogmo = useNewComponent(() =>
    Ogmo.Project(ogmoProject, {
      "player!!": (data) =>
        useChild(() => Player(new Vector(data.x, data.y), data.rotation || 0)),
      "new entity": (_data) => useChild(() => {}),
    })
  );

  ogmo.loadLevel(ogmoLevel);
}
