import {
  useNewComponent,
  useType,
  Mouse,
  useEntity,
  useUpdate,
} from "@hex-engine/2d";

export default function Unparent() {
  useType(Unparent);

  const mouse = useNewComponent(Mouse);
  const ent = useEntity();

  useUpdate(() => {
    if (mouse.isInsideBounds && mouse.isPressingRight) {
      ent.parent?.removeChild(ent);
      ent.destroy();
    }
  });
}
