import {
  createRoot,
  useNewComponent,
  Canvas,
  Ogmo,
  useChild,
  SystemFont,
  Label,
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

      const ogmo = useNewComponent(() => Ogmo.Project(project, {}));

      ogmo.loadLevel(level);
    });
  });
  cy.matchImageSnapshot();
});

it("renders correctly - custom decals", () => {
  cy.createCanvas().then(($canvas) => {
    createRoot(() => {
      const canvas = useNewComponent(() =>
        Canvas({ backgroundColor: "white", element: $canvas[0] })
      );
      canvas.fullscreen();

      const ogmo = useNewComponent(() =>
        Ogmo.Project(project, {}, (decalData) =>
          useChild(() => {
            const font = useNewComponent(() =>
              SystemFont({ name: "sans-serif", size: 10 })
            );
            const label = useNewComponent(() => Label({ font }));

            useDraw((context) => {
              label.text = JSON.stringify(decalData);
              label.draw(context, { x: decalData.x, y: decalData.y });
            });
          })
        )
      );

      ogmo.loadLevel(level);
    });
  });
  cy.matchImageSnapshot();
});
