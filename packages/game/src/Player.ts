import {
  useNewComponent,
  useDraw,
  useType,
  Aseprite,
  Vector,
  Geometry,
  Polygon,
} from "@hex-engine/2d";
import playerOverworld from "./player-overworld.aseprite";

export default function Player(position: Vector, rotation: number) {
  useType(Player);

  const aseprite = useNewComponent(() => Aseprite(playerOverworld));
  aseprite.currentAnim = aseprite.animations.down;
  aseprite.currentAnim.play();

  useNewComponent(() =>
    Geometry({
      shape: Polygon.rectangle(aseprite.size),
      position,
      rotation,
    })
  );

  useDraw(
    (context) => {
      aseprite.draw(context);
    },
    { roundToNearestPixel: true }
  );
}
