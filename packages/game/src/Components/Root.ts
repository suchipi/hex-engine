import {
  Canvas,
  Position,
  Rotation,
  Scale,
  useNewComponent,
  useChild,
  useType,
  useEntityName,
  Camera,
} from "@hex-engine/2d";
import Level1 from "./Level1";

export default function Root() {
  useType(Root);

  const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
  canvas.setPixelated(true);
  canvas.fullscreen({ pixelZoom: 3 });

  useChild(() => {
    useEntityName("camera");

    useNewComponent(Position);
    useNewComponent(Rotation);
    useNewComponent(Scale);
    useNewComponent(Camera);
  });

  useChild(Level1);
}
