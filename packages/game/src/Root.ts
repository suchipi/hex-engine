import {
  Canvas,
  useNewComponent,
  useChild,
  useType,
  Vector,
  Physics,
  AudioContext,
  useCanvasSize,
} from "@hex-engine/2d";
import Button from "./Button";
import FPS from "./FPS";
import Hex from "./Hex";
import Scene from "./Scene";
import Controls from "./Controls";
import CustomDrawOrder from "./CustomDrawOrder";
import Test from "./Test";

export default function Root() {
  useType(Root);

  const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
  canvas.setPixelated(true);
  canvas.fullscreen({ pixelZoom: 2 });

  useNewComponent(CustomDrawOrder);

  useNewComponent(AudioContext);
  useNewComponent(Physics.Engine);
  useNewComponent(FPS);
  useNewComponent(Controls);

  const scene = useChild(Scene).rootComponent;

  useChild(() => {
    Button({
      calcPosition: (size) =>
        new Vector(0, canvas.element.height)
          .subtractYMutate(size.y / 2)
          .addXMutate(size.x / 2)
          .roundMutate(),
      text: "Create Hex",
      onClick: () => {
        const randomX = Math.random() * canvas.element.width;

        scene.useChild(() => Hex({ position: new Vector(randomX, 0) }));
      },
    });
  });

  const { canvasSize } = useCanvasSize();

  useChild(() => Test(canvasSize.divide(2)));
}
