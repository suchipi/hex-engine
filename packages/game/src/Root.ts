import {
  Canvas,
  useNewComponent,
  useChild,
  useType,
  Vector,
  Ogmo,
  Aseprite,
  useDraw,
  useRawDraw,
  Geometry,
  Circle,
  useUpdate,
  Physics,
  Polygon,
  useEntityName,
} from "@hex-engine/2d";
import player from "./player.aseprite";
import floppy from "./floppy.aseprite";
import ogmoProject from "./project.ogmo";
import ogmoLevel from "./level.json";

function Player(info: Ogmo.EntityFactoryInfo) {
  useType(Player);

  const geometry = useNewComponent(() => Geometry(info));
  const sprite = useNewComponent(() => Aseprite(player));

  useDraw((context) => {
    sprite.draw(context);
  });
}

function Floppy(info: Ogmo.EntityFactoryInfo) {
  useType(Floppy);

  const geometry = useNewComponent(() => Geometry(info));
  const sprite = useNewComponent(() => Aseprite(floppy));

  useDraw((context) => {
    sprite.draw(context);
  });
}

function Level() {
  const project = useNewComponent(() =>
    Ogmo.Project(ogmoProject, {
      player: (info) => useChild(() => Player(info)),
      floppy: (info) => useChild(() => Floppy(info)),
    })
  );

  useRawDraw((context) => {
    context.translate(128, 128);
  });

  project.useLevel(ogmoLevel);
}

export default function Root() {
  useType(Root);

  const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
  canvas.setPixelated(true);
  canvas.fullscreen({ pixelZoom: 2 });

  useNewComponent(() => Physics.Engine({ debugDraw: true }));

  // useChild(Level);

  useChild(() => {
    useEntityName("y-line");

    const geom = useNewComponent(() =>
      Geometry({
        shape: Polygon.rectangle(4000, 1),
        position: new Vector(0, 100),
      })
    );

    useDraw((context) => {
      context.fillStyle = "red";
      geom.shape.draw(context, "fill");
    });
  });

  useChild(() => {
    useEntityName("green circle");

    const geom = useNewComponent(() =>
      Geometry({
        shape: new Circle(10),
        position: new Vector(90, 100),
        // origin: new Vector(-3, -3),
      })
    );

    // const body = useNewComponent(() => Physics.Body(geom));

    useUpdate((delta) => {
      geom.rotation += 0.01 * delta;
      // body.setAngularVelocity(0.01);
    });

    const centerPoint = new Circle(1);

    useDraw((context) => {
      context.fillStyle = "green";
      geom.shape.draw(context, "fill");

      context.strokeStyle = "black";
      context.strokeRect(0, 0, 10, 10);

      context.translate(9, 9);
      context.fillStyle = "black";
      centerPoint.draw(context, "fill");
    });
  });

  useChild(() => {
    useEntityName("blue circle");

    const geom = useNewComponent(() =>
      Geometry({
        shape: new Circle(10),
        position: new Vector(50, 100),
        origin: new Vector(-9, -7),
      })
    );

    // const body = useNewComponent(() => Physics.Body(geom));

    useUpdate((delta) => {
      geom.rotation += 0.001 * delta;
      // body.setAngularVelocity(0.01);
    });

    const centerPoint = new Circle(1);

    useDraw((context) => {
      context.fillStyle = "blue";
      geom.shape.draw(context, "fill");

      context.strokeStyle = "black";
      context.strokeRect(0, 0, 10, 10);

      context.translate(0, 2);
      context.fillStyle = "black";
      centerPoint.draw(context, "fill");
    });
  });

  useChild(() => {
    useEntityName("floor");

    const geom = useNewComponent(() =>
      Geometry({
        shape: Polygon.rectangle(200, 50),
        position: new Vector(50, 200),
      })
    );

    useNewComponent(() => Physics.Body(geom, { isStatic: true }));

    useDraw((context) => {
      context.fillStyle = "gray";
      geom.shape.draw(context, "fill");
    });
  });
}
