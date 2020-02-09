import { createRoot, useNewComponent, Canvas, Ogmo } from "@hex-engine/2d";
import project from "./project.ogmo";
import level from "./level.json";

it("renders correctly", () => {
  cy.createCanvas().then(($canvas) => {
    createRoot(() => {
      const canvas = useNewComponent(() =>
        Canvas({ backgroundColor: "white", element: $canvas[0] })
      );
      canvas.fullscreen();

      const ogmo = useNewComponent(() => Ogmo(project, {}));

      ogmo.loadLevel(level);
    });
  });
  cy.matchImageSnapshot();
});
