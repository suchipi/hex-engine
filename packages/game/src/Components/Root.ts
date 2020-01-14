import {
  Canvas,
  Position,
  Rotation,
  Scale,
  useNewComponent,
  useChild,
  useType,
  useEntityName,
} from "@hex-engine/2d";
import Level1 from "./Level1";
import FPS from "./FPS";

export default function Root() {
  useType(Root);

  const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
  canvas.setPixelated(true);
  canvas.fullscreen({ pixelZoom: 3 });

  useNewComponent(Position);
  useNewComponent(Rotation);
  useNewComponent(Scale);

  useChild(Level1);
  useChild(FPS);
}
