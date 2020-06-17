import {
  useNewComponent,
  useDraw,
  useType,
  LowLevelMouse,
  useEntitiesAtPoint,
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
        physics?: null | ReturnType<typeof Physics.Body>;
        originalStatic: boolean;
      }
    | {
        present: false;
      };

  let target: Target = {
    present: false,
  };
  let isDown = false;

  const mouse = useNewComponent(LowLevelMouse);
  mouse.onMouseDown(({ pos }) => {
    isDown = true;

    const ent = useEntitiesAtPoint(pos)[0];
    if (!ent) return;

    const geometry = ent.getComponent(Geometry);
    if (!geometry) return;

    const physics = ent.getComponent(Physics.Body);
    let originalStatic = false;
    if (physics) {
      originalStatic = physics.body.isStatic;
      physics.setStatic(true);
    }

    // @ts-ignore
    target = {
      present: true,
      ent,
      geometry,
      physics,
      originalStatic,
    };
  });
  mouse.onMouseMove(({ delta }) => {
    if (isDown && target.present) {
      target.geometry.position.addMutate(delta);
    }
  });
  function handleUp() {
    isDown = false;
    if (target.present) {
      if (target.physics) {
        target.physics.setStatic(target.originalStatic);
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
      context.lineWidth = 2;

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
