import { useType, useNewComponent, useEnableDisable } from "@hex-engine/core";
import Animation, { AnimationFrame } from "./Animation";

export default function Aseprite(data: AsepriteLoader.Data) {
  useType(Aseprite);

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

  function colorAtPixel(cel: AsepriteLoader.Cel, x: number, y: number): string {
    if (data.colorDepth === 32) {
      // 32-bit color, one byte for each r, g, b, a
      const offset = 4 * (x + cel.w * y);
      const r = cel.rawCelData[offset + 0];
      const g = cel.rawCelData[offset + 1];
      const b = cel.rawCelData[offset + 2];
      const a = cel.rawCelData[offset + 3];

      return `rgba(${r}, ${g}, ${b}, ${a})`;
    } else if (data.colorDepth === 8) {
      // indexed color. one byte for each pixel, referencing colors from palette
      const offset = x + cel.w * y;
      const index = cel.rawCelData[offset];

      if (!data.palette) {
        throw new Error(
          "Invalid Aseprite file: Uses indexed color but there is no color palette"
        );
      }
      const color = data.palette.colors[index];

      return `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha})`;
    } else if (data.colorDepth === 16) {
      // grayscale
      const offset = 2 * (x + cel.w * y);
      const value = cel.rawCelData[offset + 0];
      const alpha = cel.rawCelData[offset + 1];

      return `rgba(${value}, ${value}, ${value}, ${alpha})`;
    } else {
      throw new Error(`Unsupported Aseprite color depth: ${data.colorDepth}`);
    }
  }

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
          context.fillStyle = colorAtPixel(cel, i, j);
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
