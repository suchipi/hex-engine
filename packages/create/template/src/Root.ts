import {
  useType,
  useNewComponent,
  useChild,
  Canvas,
  Physics,
  Vector,
} from "@hex-engine/2d";
import Floor from "./Floor";
import Box from "./Box";

export default function Root() {
  useType(Root);

  const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
  canvas.fullscreen({ pixelZoom: 3 });

  useNewComponent(Physics.Engine);

  const canvasCenter = new Vector(
    canvas.element.width / 2,
    canvas.element.height / 2
  );

  useChild(() => Floor(canvasCenter.addY(100)));
  useChild(() => Box(canvasCenter));
}
