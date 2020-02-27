import {
  useType,
  useNewComponent,
  useEntity,
  Geometry,
  Physics,
  Mouse,
  Vector,
  LowLevelMouse,
} from "@hex-engine/2d";

export default function Draggable(geometry: ReturnType<typeof Geometry>) {
  useType(Draggable);

  const physics = useEntity().getComponent(Physics.Body);

  const mouse = useNewComponent(Mouse);
  const { onCanvasLeave } = useNewComponent(LowLevelMouse);

  let originalStatic = false;
  let isDragging = false;
  const startedDraggingAt = new Vector(0, 0);

  mouse.onDown((event) => {
    if (physics) {
      originalStatic = physics.body.isStatic;
      physics.setStatic(true);
    }
    isDragging = true;
    startedDraggingAt.mutateInto(event.pos);
  });

  mouse.onMove((event) => {
    if (isDragging) {
      geometry.position.addMutate(event.pos.subtract(startedDraggingAt));
    }
  });

  const onUpHandler = () => {
    if (physics) {
      physics.setStatic(originalStatic);
    }
    isDragging = false;
  };
  mouse.onUp(onUpHandler);
  onCanvasLeave(onUpHandler);
}
