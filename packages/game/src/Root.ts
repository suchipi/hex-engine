import {
  Canvas,
  useNewComponent,
  useChild,
  useType,
  useCallbackAsCurrent,
  Point,
  Physics,
} from "@hex-engine/2d";
import Button from "./Button";
import FPS from "./FPS";
import Hex from "./Hex";
import Floor from "./Floor";

export default function Root() {
  useType(Root);

  const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
  canvas.setPixelated(true);
  canvas.fullscreen({ pixelZoom: 2 });

  useNewComponent(Physics.Engine);
  useNewComponent(FPS);

  const useRootChild = useCallbackAsCurrent(useChild);
  useChild(() => {
    useNewComponent(() =>
      Button({
        calcPosition: () =>
          new Point(
            canvas.element.width / 2,
            canvas.element.height / 2
          ).roundMutate(),
        text: "Create Hex",
        onClick: () => {
          const randomX = Math.random() * canvas.element.width;

          useRootChild(() => Hex({ position: new Point(randomX, 0) }));
        },
      })
    );
  });

  useChild(Floor);

  useChild(() => {
    useNewComponent(() =>
      Button({
        calcPosition: (size) =>
          new Point(canvas.element.width, canvas.element.height)
            .subtractMutate(size.divide(2))
            .roundMutate(),
        text: "Font: Silver by Poppy Works",
        onClick: () => {
          window.open("https://poppyworks.itch.io/silver", "_blank");
        },
      })
    );
  });

  useNewComponent(Physics.MouseConstraint);
}
