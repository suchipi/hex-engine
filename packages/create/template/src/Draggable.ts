import {
  useType,
  useNewComponent,
  useEntity,
  Geometry,
  Physics,
  Mouse,
} from "@hex-engine/2d";

export default function Draggable(geometry: ReturnType<typeof Geometry>) {
  useType(Draggable);

  const physics = useEntity().getComponent(Physics.Body);

  const mouse = useNewComponent(Mouse);

  let originalStatic = false;
  let isDragging = false;

  mouse.onDown(() => {
    if (physics) {
      originalStatic = physics.body.isStatic;
      physics.setStatic(true);
    }
    isDragging = true;
  });

  mouse.onMove((event) => {
    if (isDragging) {
      geometry.position.addMutate(event.delta);
    }
  });

  mouse.onUp(() => {
    if (physics) {
      physics.setStatic(originalStatic);
    }
    isDragging = false;
  });
}
