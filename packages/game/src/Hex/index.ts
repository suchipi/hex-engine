import {
  useNewComponent,
  Position,
  Rotation,
  Origin,
  Point,
  Aseprite,
  useUpdate,
  useDraw,
} from "@hex-engine/2d";
import hexSprite from "./hex.aseprite";

export default function Hex({ position }: { position: Point }) {
  const aseprite = useNewComponent(() => Aseprite(hexSprite));

  useNewComponent(() => Origin(aseprite.size.divide(2)));
  useNewComponent(() => Position(position));
  const rotation = useNewComponent(Rotation);

  useUpdate((delta) => {
    rotation.addMutate(Math.PI * 0.001 * delta);
  });

  useDraw((context) => {
    aseprite.draw(context);
  });
}
