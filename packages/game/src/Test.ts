import {
  useType,
  useNewComponent,
  useChild,
  useDraw,
  Circle,
  Geometry,
  Vector,
  Tiled
} from "@hex-engine/2d";
import EmbeddedTiledMap from "./tiledmaps/map-embedded-tileset.xml";
import XMLENcodedMap from "./tiledmaps/map-xml-encoded.xml";
import CSVEncodedMap from "./tiledmaps/map-csv-encoded.xml";
import Base64TiledMap from "./tiledmaps/map-base64-encoded.xml";

export default function Test(position: Vector) {
  useType(Test);

  const csvEncodedMap = Tiled.Map(CSVEncodedMap);
  const xmlEncodedMap = Tiled.Map(XMLENcodedMap);
  const embeddedMap = Tiled.Map(EmbeddedTiledMap);
  // const base64EncodedMap = Tiled.Map(Base64TiledMap); // Should error because not supported

  const geometry = useNewComponent(() =>
    Geometry({
      shape: new Circle(100),
      position,
    })
  );

  useDraw((context) => {
    context.lineWidth = 1;
    context.strokeStyle = "blue";
    geometry.shape.draw(context, "stroke");
  });

  useChild(() => {
    const geometry = useNewComponent(() =>
      Geometry({
        shape: new Circle(90),
      })
    );

    useDraw((context) => {
      context.lineWidth = 1;
      context.strokeStyle = "blue";
      geometry.shape.draw(context, "stroke");
    });

    useChild(() => {
      const geometry = useNewComponent(() =>
        Geometry({
          shape: new Circle(80),
        })
      );

      useDraw((context) => {
        context.lineWidth = 1;
        context.strokeStyle = "blue";
        geometry.shape.draw(context, "stroke");
      });

      useChild(() => {
        const geometry = useNewComponent(() =>
          Geometry({
            shape: new Circle(50),
          })
        );

        useDraw((context) => {
          context.lineWidth = 1;
          context.strokeStyle = "blue";
          geometry.shape.draw(context, "stroke");
        });
      });
    });
  });
}
