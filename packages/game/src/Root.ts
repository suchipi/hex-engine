import {
  Canvas,
  useNewComponent,
  useChild,
  useType,
  Point,
  Physics,
  AudioContext,
} from "@hex-engine/2d";
import Button from "./Button";
import FPS from "./FPS";
import Hex from "./Hex";
import Scene from "./Scene";
import Controls from "./Controls";
import CustomDrawOrder from "./CustomDrawOrder";

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
        new Point(0, canvas.element.height)
          .subtractYMutate(size.y / 2)
          .addXMutate(size.x / 2)
          .roundMutate(),
      text: "Create Hex",
      onClick: () => {
        const randomX = Math.random() * canvas.element.width;

        scene.useChild(() => Hex({ position: new Point(randomX, 0) }));
      },
    });
  });
}
