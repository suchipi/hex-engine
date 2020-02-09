import {
  createRoot,
  useNewComponent,
  Canvas,
  Ogmo,
  useChild,
  Label,
  SystemFont,
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
        Ogmo.Project(project, {
          entity_1: (data) =>
            useChild(() => {
              const font = useNewComponent(() =>
                SystemFont({ name: "sans-serif", size: 9 })
              );
              const label = useNewComponent(() => Label({ font }));

              useDraw((context) => {
                label.text = JSON.stringify(data);
                label.draw(context, {
                  x: 0,
                  y: data.y,
                });
              });
            }),
        })
      );

      ogmo.loadLevel(level);
    });
  });
  cy.matchImageSnapshot();
});
