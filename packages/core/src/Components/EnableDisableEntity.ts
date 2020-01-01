import { Entity } from "../Interface";
import HooksSystem from "../HooksSystem";
const { useEntity } = HooksSystem.hooks;

function enable(entity: Entity) {
  for (const component of entity.components) {
    const comp = component as any;
    if (
      typeof comp.enable === "function" &&
      typeof comp.getIsEnabled === "function" &&
      !comp.getIsEnabled()
    ) {
      comp.enable();
    }
  }
  for (const child of entity.children) {
    enable(child);
  }
}

function disable(entity: Entity) {
  for (const component of entity.components) {
    const comp = component as any;
    if (
      typeof comp.disable === "function" &&
      typeof comp.getIsEnabled === "function" &&
      comp.getIsEnabled()
    ) {
      comp.disable();
    }
  }
  for (const child of entity.children) {
    disable(child);
  }
}

export default function EnableDisableEntity() {
  const ent = useEntity();

  return {
    enable: () => {
      enable(ent);
    },

    disable: () => {
      disable(ent);
    },
  };
}
