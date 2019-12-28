import { getEntity } from "@hex-engine/core";
import { Angle, Point } from "../Models";

type Props = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  backgroundColor: string;
};

export default function Renderer({ canvas, context, backgroundColor }: Props) {
  const api = {
    scale: new Point(1, 1),
    translation: new Point(0, 0),
    rotation: new Angle(0),

    render() {
      // Reset transform
      context.setTransform(1, 0, 0, 1, 0, 0);

      // Clear canvas
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.scale(api.scale.x, api.scale.y);
      context.translate(api.translation.x, api.translation.y);
      context.rotate(api.rotation.radians);

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

  return api;
}
