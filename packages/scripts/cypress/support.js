import "../dist/polyfills";
import { addMatchImageSnapshotCommand } from "cypress-image-snapshot/command";

addMatchImageSnapshotCommand();

import { createRoot, useNewComponent, Canvas } from "@hex-engine/2d";

Cypress.Commands.add("keydown", (key) => {
  cy.get("body").trigger("keydown", { key });
});

Cypress.Commands.add("keyup", (key) => {
  cy.get("body").trigger("keyup", { key });
});

Cypress.Commands.add(
  "createRootWithCanvas",
  (componentFn, canvasOptions = {}) => {
    cy.get("body").then((body$) => {
      const body = body$[0];

      body.innerHTML = "";

      createRoot(() => {
        const canvas = body.ownerDocument.createElement("canvas");
        canvas.id = "canvas";

        body.appendChild(canvas);

        const options = Object.assign({ element: canvas }, canvasOptions);

        const canvasComponent = useNewComponent(() => Canvas(options));
        canvasComponent.fullscreen();

        componentFn();
      });
    });
  }
);
