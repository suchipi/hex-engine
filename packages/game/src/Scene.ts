import {
  useNewComponent,
  useChild,
  useType,
  useCallbackAsCurrent,
  Point,
  Physics,
  useDraw,
  useDestroy,
  useUpdate,
  useEntityName,
} from "@hex-engine/2d";
import Floor from "./Floor";
import Box from "./Box";

export default function Scene() {
  useType(Scene);

  useChild(Floor);

  const box1 = useChild(() => Box({ position: new Point(50, 50) }));
  const box2 = useChild(() => Box({ position: new Point(100, 50) }));

  useChild(() => {
    useEntityName("Constraint");

    useUpdate(() => {
      if (box1.parent == null || box2.parent == null) {
        useDestroy().destroy();
      }
    });

    useNewComponent(() =>
      Physics.Constraint({
        bodyA: box1.rootComponent.physics.body,
        bodyB: box2.rootComponent.physics.body,
        stiffness: 0.01,
      })
    );

    useDraw((context) => {
      const box1Pos = box1.rootComponent.geometry.worldPosition();
      const box2Pos = box2.rootComponent.geometry.worldPosition();
      context.lineWidth = 1;
      context.strokeStyle = "#666";
      context.moveTo(box1Pos.x, box1Pos.y);
      context.lineTo(box2Pos.x, box2Pos.y);
      context.stroke();
    });
  });

  return {
    useChild: useCallbackAsCurrent(useChild),
  };
}
