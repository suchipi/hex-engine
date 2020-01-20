import {
  useNewComponent,
  useDraw,
  useType,
  Mouse,
  useEntitiesAtPoint,
  Point,
  Physics,
  Entity,
  Geometry,
  useEntityTransforms,
  useEnableDisable,
} from "@hex-engine/2d";

export default function Drag() {
  useType(Drag);

  type Target =
    | {
        present: true;
        ent: Entity;
        geometry: ReturnType<typeof Geometry>;
        physics?: ReturnType<typeof Physics.Body>;
      }
    | {
        present: false;
      };

  let target: Target = {
    present: false,
  };
  let isDown = false;
  const lastPos = new Point(0, 0);

  const mouse = useNewComponent(Mouse);
  mouse.onMouseDown((pos) => {
    lastPos.mutateInto(pos);
    isDown = true;

    const ent = useEntitiesAtPoint(pos)[0];
    if (!ent) return;

    const geometry = ent.getComponent(Geometry);
    if (!geometry) return;

    const physics = ent.getComponent(Physics.Body);
    if (physics) {
      if (physics.body.isStatic) return;
      physics.setStatic(true);
    }

    // @ts-ignore
    target = {
      present: true,
      ent,
      geometry,
      physics,
    };
  });
  mouse.onMouseMove((pos) => {
    if (isDown && target.present) {
      const delta = pos.subtract(lastPos);
      target.geometry.position.addMutate(delta);
    }

    lastPos.mutateInto(pos);
  });
  function handleUp() {
    isDown = false;
    if (target.present) {
      if (target.physics) {
        target.physics.setStatic(false);
      }
      target = {
        present: false,
      };
    }
  }
  mouse.onMouseUp(handleUp);

  useDraw((context) => {
    if (target.present) {
      context.strokeStyle = "cyan";
      context.lineWidth = 1;

      const matrix = useEntityTransforms(target.ent).matrixForDrawPosition(
        false
      );
      context.transform(
        matrix.a,
        matrix.b,
        matrix.c,
        matrix.d,
        matrix.e,
        matrix.f
      );

      target.geometry.shape.draw(context, "stroke");
    }
  });

  useEnableDisable().onDisabled(() => {
    handleUp();
  });
}
