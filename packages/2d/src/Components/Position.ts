import { useType, useEntity, useCallbackAsCurrent } from "@hex-engine/core";
import { Vec2 } from "../Models";

export default function Position(vec2 = new Vec2(0, 0)) {
  useType(Position);

  const retPos = new Vec2(vec2.x, vec2.y);

  const asWorldPosition = useCallbackAsCurrent(() => {
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
  });

  const getLocalPosition = useCallbackAsCurrent((worldPosition: Vec2) => {
    const myWorldPos = asWorldPosition();
    return worldPosition.subtract(myWorldPos);
  });

  return Object.assign(retPos, {
    asWorldPosition,
    getLocalPosition,
  });
}
