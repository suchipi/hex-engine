import {
  Canvas,
  useNewComponent,
  useChild,
  useType,
  useCallbackAsCurrent,
  Vec2,
} from "@hex-engine/2d";
import Button from "./Button";
import FPS from "./FPS";
import Hex from "./Hex";

export default function Root() {
  useType(Root);

  const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
  canvas.setPixelated(true);
  canvas.fullscreen({ pixelZoom: 3 });

  useNewComponent(FPS);

  const useRootChild = useCallbackAsCurrent(useChild);
  useChild(() => {
    useNewComponent(() =>
      Button({
        calcPosition: (size) =>
          new Vec2(
            canvas.element.width / 2,
            canvas.element.height / 2
          ).subtractMutate(size.dividedBy(2)),
        text: "Create Hex",
        onClick: () => {
          const randomX = Math.random() * canvas.element.width;
          const randomY = Math.random() * canvas.element.height;

          useRootChild(() => Hex({ position: new Vec2(randomX, randomY) }));
        },
      })
    );
  });
}
