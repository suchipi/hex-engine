import {
  Canvas,
  useNewComponent,
  useType,
  useChild,
  Ogmo,
} from "@hex-engine/2d";
import FPS from "./FPS";
import ogmoProject from "./game.ogmo";
import ogmoLevel from "./levels/level1.json";

export default function Root() {
  useType(Root);

  const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
  canvas.setPixelated(true);
  canvas.fullscreen({ pixelZoom: 2 });

  useNewComponent(FPS);

  const ogmo = useNewComponent(() =>
    Ogmo(ogmoProject, {
      "player!!": (data) => useChild(() => {}),
      "new entity": (data) => useChild(() => {}),
    })
  );

  ogmo.loadLevel(ogmoLevel);
}
