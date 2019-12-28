import { getEntity } from "@hex-engine/core";

export default function Time() {
  return {
    tick(delta: number) {
      const entities = [];
      const entity = getEntity();
      if (entity) {
        entities.push(entity);
        entities.push(...entity.children);
      }

      for (const entity of entities) {
        entity.update(delta);
      }
    },
  };
}
