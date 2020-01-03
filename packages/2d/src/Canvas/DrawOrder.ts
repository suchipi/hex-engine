import { useType, Entity, Component } from "@hex-engine/core";

export default Object.assign(
  function DrawOrder(sort: (entities: Array<Entity>) => Array<Component>) {
    useType(DrawOrder);

    return { sort };
  },
  {
    defaultSort: (entities: Array<Entity>): Array<Component> => {
      let components: Array<Component> = [];

      // Draw cameras first
      for (const ent of entities) {
        components = components.concat(
          [...ent.components].filter((comp: any) => comp.isCamera)
        );
      }

      // Then draw non-cameras
      for (const ent of entities) {
        components = components.concat(
          [...ent.components].filter((comp: any) => !comp.isCamera)
        );
      }

      return components;
    },
  }
);
