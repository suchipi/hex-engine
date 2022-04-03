import {
  useType,
  useNewComponent,
  useChild,
  useDraw,
  Circle,
  Geometry,
  Vector,
} from "@hex-engine/2d";
import Unparent from "./Unparent";

export default function Test(position: Vector) {
  useType(Test);

  const geometry = useNewComponent(() =>
    Geometry({
      shape: new Circle(100),
      position,
    })
  );

  useNewComponent(Unparent);

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

    useNewComponent(Unparent);

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

      useNewComponent(Unparent);

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

        useNewComponent(Unparent);

        useDraw((context) => {
          context.lineWidth = 1;
          context.strokeStyle = "blue";
          geometry.shape.draw(context, "stroke");
        });
      });
    });
  });
}
