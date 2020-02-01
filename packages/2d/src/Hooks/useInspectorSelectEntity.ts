import { Entity } from "@hex-engine/core";
import { useInspectorSelect } from "@hex-engine/inspector";

export default function useInspectorSelectEntity(getEntity: () => Entity) {
  if (process.env.NODE_ENV === "production") return;

  const { getSelectMode, inspectEntity } = useInspectorSelect();
  const entity = getEntity();

  if (getSelectMode()) {
    inspectEntity(entity);
  }
}
