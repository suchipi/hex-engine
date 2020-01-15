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

  const cel = aseprite.currentAnim.currentFrame.data.cels[0];

  useNewComponent(() => Origin(new Vec2(cel.w, cel.h).dividedByMutate(2)));
  useNewComponent(() => Position(position));
  const rotation = useNewComponent(Rotation);

  useUpdate((delta) => {
    rotation.addMutate(Math.PI * 0.01 * delta);
  });

  useDraw((context) => {
    aseprite.drawCurrentFrameIntoContext({ context });
  });
}
