import {
  useType,
  useNewComponent,
  Geometry,
  Polygon,
  Point,
  useUpdate,
  useDraw,
  Physics,
  useDestroy,
  useEntityName,
  useContext,
  ProceduralSfx,
} from "@hex-engine/2d";
import samples from "modal-synthesis/samples";

export default function Box({ position }: { position: Point }) {
  useType(Box);
  useEntityName("Box");

  const geometry = useNewComponent(() =>
    Geometry({
      shape: Polygon.rectangle(new Point(10, 10)),
      position,
    })
  );

  const physics = useNewComponent(() => Physics.Body(geometry));

  const sound = useNewComponent(() =>
    ProceduralSfx(
      samples.forkDrop.map((mode) => ({
        ...mode,
        decay: mode.decay * 0.2,
      }))
    )
  );

  physics.onCollision((other) => {
    if (other.kind === "end") return;

    sound.play({
      amplitudeMultiplier() {
        return Math.min(
          Math.random() * ((physics.body.speed + other.body.speed) / 20),
          5
        );
      },
      decayMultiplier() {
        return Math.random();
      },
    });
  });

  const { canvas } = useContext();

  useUpdate(() => {
    if (geometry.position.y > canvas.height * 2) {
      useDestroy().destroy();
    }
  });

  useDraw((context) => {
    geometry.shape.draw(context, "stroke");
  });

  return {
    geometry,
    physics,
  };
}
