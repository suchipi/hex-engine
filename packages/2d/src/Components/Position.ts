import { useType, useEntity, useCallbackAsCurrent } from "@hex-engine/core";
import { Vec2 } from "../Models";

export default function Position(position = new Vec2(0, 0)) {
  useType(Position);

  const retPos = new Vec2(position.x, position.y);

  return Object.assign(retPos, {
    asWorldPosition: useCallbackAsCurrent(() => {
      const ent = useEntity();

      let position = retPos;

      let current = ent;
      while (current.parent) {
        const parentPosition = current.parent.getComponent(Position);
        if (parentPosition) {
          position = parentPosition.add(position);
        }

        current = current.parent;
      }

      return position;
    }),
  });
}
