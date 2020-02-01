import {
  useType,
  useNewComponent,
  Geometry,
  Polygon,
  Point,
  Aseprite,
  useUpdate,
  useDraw,
  Physics,
  useDestroy,
  useEntityName,
  useContext,
  ProceduralSfx,
} from "@hex-engine/2d";
import samples from "modal-synthesis/samples";
import hexSprite from "./hex.aseprite";

export default function Hex({ position }: { position: Point }) {
  useType(Hex);
  useEntityName("Hex");

  const aseprite = useNewComponent(() => Aseprite(hexSprite));

  const geometry = useNewComponent(() =>
    Geometry({
      shape: new Polygon([
        new Point(31.5, 0),
        new Point(58, 14),
        new Point(58, 49),
        new Point(31.5, 63),
        new Point(5, 49),
        new Point(5, 14),
      ]),
      position,
      rotation: Math.random() * 2 * Math.PI,
    })
  );

  const sound = useNewComponent(() =>
    ProceduralSfx(
      samples.glassHit.map((mode) => ({
        ...mode,
        decay: mode.decay * 0.2,
        frequency: mode.frequency * (1 + Math.random() * 0.25),
      }))
    )
  );

  const physics = useNewComponent(() => Physics.Body(geometry));

  function playSound(speed: number) {
    sound.play({
      amplitudeMultiplier() {
        return speed / 20;
      },
      decayMultiplier() {
        return Math.random();
      },
    });
  }

  physics.onCollision((other) => {
    if (other.kind === "end") return;

    playSound(physics.body.speed);
  });

  const { canvas } = useContext();

  useUpdate(() => {
    if (geometry.position.y > canvas.height * 2) {
      useDestroy().destroy();
    }
  });

  useDraw((context) => {
    aseprite.draw(context, { x: -5 });
  });
}
