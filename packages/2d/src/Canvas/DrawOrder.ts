import { useType, Entity, Component } from "@hex-engine/core";

export default Object.assign(
  function DrawOrder(sort: (entities: Array<Entity>) => Array<Component>) {
    useType(DrawOrder);

    return { sort };
  },
  {
    defaultSort: (entities: Array<Entity>): Array<Component> => {
      let components: Array<Component> = [];

      // Draw all components, sorted by id (so that later-created entities are drawn above earlier-created entities)
      for (const ent of [...entities].sort((entA, entB) => entA.id - entB.id)) {
        components = components.concat([...ent.components]);
      }

      return components;
    },
  }
);
