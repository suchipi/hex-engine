import { useRootEntity, Entity } from "@hex-engine/core";
import Inspector from ".";

export default function useInspectorSelect() {
  const inspector = useRootEntity().getComponent(Inspector);

  if (inspector === undefined) {
    throw new Error("Could not find an inspector component on the root entity");
  }

  const { getSelectMode, toggleSelectMode } = inspector!;

  console.log("is select mode?", getSelectMode());

  return {
    getSelectMode,
    inspectEntity: (entity: Entity) => {
      console.log("Inspecting entity", entity.id, entity.name);
      toggleSelectMode();
    },
  };
}
