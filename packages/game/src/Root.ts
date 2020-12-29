import {
  Canvas,
  useNewComponent,
  useChild,
  useType,
  Vector,
  Ogmo,
  Aseprite,
  useDraw,
  useRawDraw,
  Geometry,
} from "@hex-engine/2d";
import player from "./player.aseprite";
import floppy from "./floppy.aseprite";
import ogmoProject from "./project.ogmo";
import ogmoLevel from "./level.json";

function Player(info: Ogmo.EntityFactoryInfo) {
  useType(Player);

  const geometry = useNewComponent(() => Geometry(info));
  const sprite = useNewComponent(() => Aseprite(player));

  useDraw((context) => {
    sprite.draw(context);
  });
}

function Floppy(info: Ogmo.EntityFactoryInfo) {
  useType(Floppy);

  const geometry = useNewComponent(() => Geometry(info));
  const sprite = useNewComponent(() => Aseprite(floppy));

  useDraw((context) => {
    sprite.draw(context);
  });
}

function Level() {
  const project = useNewComponent(() =>
    Ogmo.Project(ogmoProject, {
      player: (info) => useChild(() => Player(info)),
      floppy: (info) => useChild(() => Floppy(info)),
    })
  );

  useRawDraw((context) => {
    context.translate(128, 128);
  });

  project.useLevel(ogmoLevel);
}

export default function Root() {
  useType(Root);

  const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
  canvas.setPixelated(true);
  canvas.fullscreen({ pixelZoom: 2 });

  useChild(Level);
}
