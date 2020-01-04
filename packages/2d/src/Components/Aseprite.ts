import { useType, useNewComponent, useEnableDisable } from "@hex-engine/core";
import Animation, { AnimationFrame } from "./Animation";

export default function Aseprite(data: AsepriteLoader.Data) {
  useType(Aseprite);

  if (data.colorDepth !== 32) {
    // TODO: grayscale, indexed
    throw new Error(`Unsupported color depth: ${data.colorDepth}`);
  }

  // TODO: forward / reverse / ping-pong
  const animation = useNewComponent(() =>
    Animation(
      data.frames.map(
        (frame) => new AnimationFrame(frame, { duration: frame.frameDuration })
      )
    )
  );

  const { onEnabled, onDisabled, ...enableDisableApi } = useEnableDisable();

  onEnabled(() => {
    animation.enable();
  });

  onDisabled(() => {
    animation.disable();
  });

  function drawCurrentFrameIntoContext({
    context,
    x = 0,
    y = 0,
  }: {
    context: CanvasRenderingContext2D;
    x?: number | void;
    y?: number | void;
  }) {
    const frame = animation.currentFrame.data;

    for (const cel of frame.cels) {
      if (cel.celType !== 0 && cel.celType !== 2) {
        throw new Error(`Unsupported cel type: ${cel.celType}`);
      }

      context.save();
      context.translate(x + cel.xpos, y + cel.ypos);
      context.globalAlpha = cel.opacity / 255;

      for (let i = 0; i < cel.w; i++) {
        for (let j = 0; j < cel.h; j++) {
          const offset = 4 * (i + cel.w * j);
          const r = cel.rawCelData[offset + 0];
          const g = cel.rawCelData[offset + 1];
          const b = cel.rawCelData[offset + 2];
          const a = cel.rawCelData[offset + 3];

          context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
          context.fillRect(i, j, 1, 1);
        }
      }

      context.restore();
    }
  }

  return {
    data,
    animation,

    drawCurrentFrameIntoContext,

    ...enableDisableApi,
  };
}
