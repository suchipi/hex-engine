import {
  createRoot,
  useNewComponent,
  Canvas,
  Ogmo,
  useChild,
  useDraw,
} from "@hex-engine/2d";
import project from "./project.ogmo";
import level from "./level.json";

it("renders correctly", () => {
  cy.createCanvas().then(($canvas) => {
    createRoot(() => {
      const canvas = useNewComponent(() =>
        Canvas({ backgroundColor: "white", element: $canvas[0] })
      );
      canvas.fullscreen();

      const ogmo = useNewComponent(() =>
        Ogmo(project, {
          entity_1: (data) =>
            useChild(() => {
              useDraw((context) => {
                context.translate(data.x, data.y);
                context.translate(-data.originX, -data.originY);

                if (data.rotation) {
                  context.rotate(data.rotation);
                }

                context.fillStyle = "red";
                context.fillRect(0, 0, data.width, data.height);
              });
            }),
        })
      );

      ogmo.loadLevel(level);
    });
  });
  cy.matchImageSnapshot();
});
