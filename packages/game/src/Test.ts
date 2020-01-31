import {
  useType,
  useNewComponent,
  useChild,
  useDraw,
  Circle,
  Geometry,
  Point,
} from "@hex-engine/2d";

export default function Test(position: Point) {
  useType(Test);

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
