import { createRoot, useNewComponent, Canvas, Ogmo } from "@hex-engine/2d";
import project from "./project.ogmo";
import levelData from "./level.json";

it("has a grid containing the data", () => {
  const {
    rootComponent: { layer },
  } = createRoot(() => {
    const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
    canvas.fullscreen();

    const ogmo = useNewComponent(() => Ogmo.Project(project, {}));

    const level = ogmo.useLevel(levelData);

    const layer = level.layers[0];

    return { layer };
  });

  expect(layer.definition).toBe("grid");
  if (layer.definition === "grid") {
    expect(layer.grid.get(0, 0)).toBe("0");
    expect(layer.grid.get(1, 1)).toBe("1");
    expect(layer.grid.get(2, 2)).toBe("b");
  }
});
