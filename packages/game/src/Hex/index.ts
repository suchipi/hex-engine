import {
  useNewComponent,
  Position,
  Rotation,
  Origin,
  Vec2,
  Aseprite,
  useUpdate,
  useDraw,
} from "@hex-engine/2d";
import hexSprite from "./hex.aseprite";

export default function Hex({ position }: { position: Vec2 }) {
  const aseprite = useNewComponent(() => Aseprite(hexSprite));

  useNewComponent(() => Origin(aseprite.size.dividedBy(2)));
  useNewComponent(() => Position(position));
  const rotation = useNewComponent(Rotation);

  useUpdate((delta) => {
    rotation.addMutate(Math.PI * 0.001 * delta);
  });

  useDraw((context) => {
    aseprite.draw(context);
  });
}
