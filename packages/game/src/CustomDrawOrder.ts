import { useType, useNewComponent, Canvas } from "@hex-engine/2d";
import Flick from "./Flick";

export default function CustomDrawOrder() {
  useType(CustomDrawOrder);

  useNewComponent(() =>
    Canvas.DrawOrder(function sort(entities) {
      const sorted = Canvas.DrawOrder.defaultSort(entities);
      return sorted.sort((a, b) => {
        if (a.type === Flick) return 1;
        if (b.type === Flick) return -1;
        return 0;
      });
    })
  );
}
