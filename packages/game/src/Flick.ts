import {
  useNewComponent,
  useDraw,
  useType,
  Mouse,
  useEntitiesAtPoint,
  Point,
  Physics,
  Vector,
} from "@hex-engine/2d";

export default function Flick() {
  useType(Flick);

  const downPoint = new Point(0, 0);
  const holdPoint = new Point(0, 0);

  const mouse = useNewComponent(Mouse);

  let isDown = false;
  mouse.onMouseDown((pos) => {
    isDown = true;
    downPoint.mutateInto(pos);
    holdPoint.mutateInto(pos);
  });
  mouse.onMouseMove((pos) => {
    if (isDown) {
      holdPoint.mutateInto(pos);
    }
  });
  mouse.onMouseUp(() => {
    isDown = false;
    const entAtCursor = useEntitiesAtPoint(downPoint)[0];
    if (!entAtCursor) return;
    const physics = entAtCursor.getComponent(Physics.Body);
    if (!physics) return;
    const vector = Vector.fromPoints(downPoint, holdPoint)
      .multiplyMutate(physics.body.mass)
      .divideMutate(1000);
    vector.angle.addMutate(Math.PI); // Invert direction
    physics.applyForce(downPoint, vector);
  });

  useDraw((context) => {
    if (isDown) {
      context.lineWidth = 1;
      context.strokeStyle = "black";
      context.beginPath();
      context.moveTo(downPoint.x, downPoint.y);
      context.lineTo(holdPoint.x, holdPoint.y);
      context.stroke();
    }
  });
}
