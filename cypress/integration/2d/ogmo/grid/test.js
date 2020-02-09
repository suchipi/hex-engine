import { createRoot, useNewComponent, Canvas, Ogmo } from "@hex-engine/2d";
import project from "./project.ogmo";
import levelData from "./level.json";

it("has a grid containing the data", () => {
  cy.createCanvas().then(($canvas) => {
    createRoot(() => {
      const canvas = useNewComponent(() =>
        Canvas({ backgroundColor: "white", element: $canvas[0] })
      );
      canvas.fullscreen();

      const ogmo = useNewComponent(() => Ogmo(project, {}));

      const level = ogmo.loadLevel(levelData);

      const layer = level.layers[0];

      cy.wrap(layer)
        .its("definition")
        .should("eq", "grid");
      cy.wrap(layer)
        .its("grid")
        .invoke("get", 0, 0)
        .should("eq", "0");
      cy.wrap(layer)
        .its("grid")
        .invoke("get", 1, 1)
        .should("eq", "1");
      cy.wrap(layer)
        .its("grid")
        .invoke("get", 2, 2)
        .should("eq", "b");
    });
  });
});
