import {
  useNewComponent,
  Geometry,
  Polygon,
  Point,
  Aseprite,
  useUpdate,
  useDraw,
} from "@hex-engine/2d";
import hexSprite from "./hex.aseprite";

export default function Hex({ position }: { position: Point }) {
  const aseprite = useNewComponent(() => Aseprite(hexSprite));

  const geometry = useNewComponent(() =>
    Geometry({
      shape: Polygon.rectangle(aseprite.size),
      position,
    })
  );

  useUpdate((delta) => {
    geometry.rotation.addMutate(Math.PI * 0.001 * delta);
  });

  useDraw((context) => {
    aseprite.draw(context);
  });
}
