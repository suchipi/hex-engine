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
} from "@hex-engine/2d";
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
    })
  );

  useNewComponent(() => Physics.Body(geometry));

  const { canvas } = useContext();

  useUpdate((delta) => {
    geometry.rotation.addMutate(Math.PI * 0.001 * delta);

    if (geometry.position.y > canvas.height * 2) {
      useDestroy().destroy();
    }
  });

  useDraw((context) => {
    // TODO: is this a bug in the aseprite component?
    aseprite.draw(context, { x: -5, y: 0 });
  });
}
