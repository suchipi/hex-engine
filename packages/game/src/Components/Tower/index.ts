import {
  useNewComponent,
  Position,
  Vec2,
  Aseprite,
  useDraw,
  BoundingBox,
  useType,
} from "@hex-engine/2d";

import sprite from "./tower.aseprite";

export default function Tower({ position }: { position: Vec2 }) {
  useType(Tower);

  useNewComponent(() => Position(position));
  useNewComponent(() => BoundingBox(new Vec2(16, 16)));

  const aseprite = useNewComponent(() => Aseprite(sprite));

  aseprite.currentAnim.play();

  useDraw((context) => {
    aseprite.drawCurrentFrameIntoContext({ context });
  });
}
