import {
  useNewComponent,
  useChild,
  useType,
  Keyboard,
  useUpdate,
} from "@hex-engine/2d";
import Flick from "./Flick";
import Drag from "./Drag";

export default function Controls() {
  useType(Controls);

  const keyboard = useNewComponent(Keyboard);
  const flick = useChild(Flick);
  const drag = useChild(Drag);

  flick.disable();
  drag.disable();

  useUpdate(() => {
    if (keyboard.pressed.has("Alt")) {
      drag.disable();
      flick.enable();
    } else {
      flick.disable();
      drag.enable();
    }
  });

  return { keyboard };
}
