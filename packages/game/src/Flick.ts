import {
  useNewComponent,
  useDraw,
  useType,
  Mouse,
  useEntitiesAtPoint,
  Point,
  Physics,
  Vector,
  Entity,
  Geometry,
  useEntityTransforms,
  useEnableDisable,
} from "@hex-engine/2d";

export default function Flick() {
  useType(Flick);

  const downPoint = new Point(0, 0);
  const holdPoint = new Point(0, 0);
  let target: Entity | null = null;

  const mouse = useNewComponent(Mouse);

  let isDown = false;
  mouse.onMouseDown(({ pos }) => {
    isDown = true;
    downPoint.mutateInto(pos);
    holdPoint.mutateInto(pos);

    const entAtCursor = useEntitiesAtPoint(downPoint)[0];
    if (!entAtCursor) return;

    const physics = entAtCursor.getComponent(Physics.Body);
    if (!physics) return;

    if (physics.body.isStatic) return;

    target = entAtCursor;
    physics.setStatic(true);
  });
  mouse.onMouseMove(({ pos }) => {
    if (isDown) {
      holdPoint.mutateInto(pos);
    }
  });
  mouse.onMouseUp(() => {
    isDown = false;
    if (!target) return;
    const physics = target.getComponent(Physics.Body);
    if (!physics) return;
    physics.setStatic(false);

    const vector = Vector.fromPoints(downPoint, holdPoint)
      .multiplyMutate(physics.body.mass)
      .divideMutate(1000);
    vector.angle.addMutate(Math.PI); // Invert direction
    physics.applyForce(downPoint, vector);

    target = null;
  });

  useDraw((context) => {
    if (isDown) {
      context.lineWidth = 2;
      context.strokeStyle = "cyan";
      context.beginPath();
      context.moveTo(downPoint.x, downPoint.y);
      context.lineTo(holdPoint.x, holdPoint.y);
      context.stroke();
    }

    if (target) {
      const geometry = target.getComponent(Geometry);
      if (geometry) {
        context.strokeStyle = "cyan";
        context.lineWidth = 2;

        const matrix = useEntityTransforms(target).matrixForDrawPosition(false);
        context.transform(
          matrix.a,
          matrix.b,
          matrix.c,
          matrix.d,
          matrix.e,
          matrix.f
        );

        geometry.shape.draw(context, "stroke");
      }
    }
  });

  useEnableDisable().onDisabled(() => {
    if (target) {
      const physics = target.getComponent(Physics.Body);
      if (physics) physics.setStatic(false);
    }
    target = null;
    isDown = false;
  });
}
