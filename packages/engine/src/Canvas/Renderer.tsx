import { getEntity } from "core";
import { Angle, Point } from "../Models";

type Data = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  backgroundColor: string;
};

export default function Renderer({ canvas, context, backgroundColor }: Data) {
  return {
    scale(point: Point): void {
      context.scale(point.x, point.y);
    },

    translate(point: Point): void {
      context.translate(point.x, point.y);
    },

    rotate(angle: number | Angle) {
      let angleRad = 0;
      if (typeof angle === "number") {
        angleRad = angle;
      } else {
        angleRad = angle.radians;
      }

      context.rotate(angleRad);
    },

    render() {
      // Reset transform
      context.setTransform(1, 0, 0, 1, 0, 0);

      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);

      const entities = [];
      const entity = getEntity();
      if (entity) {
        entities.push(entity);
        entities.push(...entity.children);
      }

      for (const entity of entities) {
        entity.draw({ canvas, context });
      }
    },
  };
}
