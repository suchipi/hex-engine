import {
  useNewComponent,
  useDraw,
  useUpdate,
  Label,
  useType,
} from "@hex-engine/2d";
import useGameFont from "./useGameFont";

export default function FPS() {
  useType(FPS);

  const font = useGameFont();
  const label = useNewComponent(() => Label({ text: "0fps", font }));

  let last10: Array<number> = [];

  const documentTitle = document.title;

  useUpdate((delta) => {
    const fps = 1 / (delta / 1000);

    last10.unshift(fps);
    if (last10.length > 10) {
      last10 = last10.slice(0, 9);
    }

    const average =
      last10.reduce((prev, curr) => prev + curr, 0) / last10.length;

    label.text = `${Math.round(average)}fps`;

    document.title = `${documentTitle} (${label.text})`;
  });

  useDraw((context) => {
    label.drawLabel({ context, x: 1 });
  });
}
