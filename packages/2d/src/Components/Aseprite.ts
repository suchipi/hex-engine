import {
  useType,
  useNewComponent,
  useEnableDisable,
  Component,
} from "@hex-engine/core";
import Animation, { AnimationFrame, AnimationAPI } from "./Animation";
import { Vector } from "../Models";

const LAYER_BLEND_MODES: { [mode: number]: string } = {
  0: "Normal",
  1: "Multiply",
  2: "Screen",
  3: "Overlay",
  4: "Darken",
  5: "Lighten",
  6: "Color Dodge",
  7: "Color Burn",
  8: "Hard Light",
  9: "Soft Light",
  10: "Difference",
  11: "Exclusion",
  12: "Hue",
  13: "Saturation",
  14: "Color",
  15: "Luminosity",
  16: "Addition",
  17: "Subtract",
  18: "Divide",
};

const CANVAS_COMPOSITE_OPERATIONS_BY_BLEND_MODE: { [mode: number]: string } = {
  0: "source-over",
  1: "multiply",
  2: "screen",
  3: "overlay",
  4: "darken",
  5: "lighten",
  6: "color-dodge",
  7: "color-burn",
  8: "hard-light",
  9: "soft-light",
  10: "difference",
  11: "exclusion",
  12: "hue",
  13: "saturation",
  14: "color",
  15: "luminosity",

  // There's no cooresponding globalCompositeOperation for these. We'd have to
  // implement them using getImageData/putImageData.
  // 16: "Addition",
  // 17: "Subtract",
  // 18: "Divide",
};

const frameCache = new WeakMap();

/** A Component which loads and draws Aseprites sprites and animations. */
export default function Aseprite(data: AsepriteLoader.Data) {
  useType(Aseprite);

  const maxW = data.frames.reduce(
    (prevFrameVal, frame) =>
      Math.max(
        prevFrameVal,
        frame.cels.reduce(
          (prevCelVal, cel) => Math.max(prevCelVal, cel.w + cel.xpos),
          0
        )
      ),
    0
  );
  const maxH = data.frames.reduce(
    (prevFrameVal, frame) =>
      Math.max(
        prevFrameVal,
        frame.cels.reduce(
          (prevCelVal, cel) => Math.max(prevCelVal, cel.h + cel.ypos),
          0
        )
      ),
    0
  );
  const size = new Vector(maxW, maxH);

  const animations: {
    [name: string]: AnimationAPI<HTMLCanvasElement> & Component;
  } = {};

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

      // TODO: ase-parser doesn't give us the palette entry that represents transparent from the header
      // as described here: https://github.com/aseprite/aseprite/blob/master/docs/ase-file-specs.md#header
      // so we have to assume it's index 0 (which is the default, but the user can change it)
      if (index === 0) {
        return `rgba(0, 0, 0, 0)`;
      }

      return `rgba(${color.red}, ${color.green}, ${color.blue}, ${color.alpha /
        255})`;
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

  function convertFrameToImage(frame: AsepriteLoader.Frame): HTMLCanvasElement {
    if (frameCache.has(frame)) {
      return frameCache.get(frame);
    }

    const canvas = document.createElement("canvas");
    canvas.width = size.x;
    canvas.height = size.y;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Couldn't get 2d context for canvas");
    }

    const celsSortedByLayerIndex = frame.cels.sort(
      (celA, celB) => celA.layerIndex - celB.layerIndex
    );

    for (const cel of celsSortedByLayerIndex) {
      if (cel.celType !== 0 && cel.celType !== 2) {
        throw new Error(`Unsupported cel type: ${cel.celType}`);
      }

      context.save();

      let alpha = cel.opacity / 255;

      const layer = data.layers[cel.layerIndex];
      if (layer) {
        alpha = alpha * (layer.opacity / 255);

        const blendMode = layer.blendMode;
        const compositeOperation =
          CANVAS_COMPOSITE_OPERATIONS_BY_BLEND_MODE[blendMode];
        if (compositeOperation) {
          context.globalCompositeOperation = compositeOperation;
        } else {
          const blendModeNiceName = LAYER_BLEND_MODES[blendMode];
          throw new Error(
            `Unsupported Aseprite layer blending mode: ${blendModeNiceName ||
              blendMode}`
          );
        }
      }

      context.translate(cel.xpos, cel.ypos);
      context.globalAlpha = alpha;

      for (let i = 0; i < cel.w; i++) {
        for (let j = 0; j < cel.h; j++) {
          context.fillStyle = colorAtPixel(cel, i, j);
          context.fillRect(i, j, 1, 1);
        }
      }

      context.restore();
    }

    frameCache.set(frame, canvas);
    return canvas;
  }

  animations.default = useNewComponent(() =>
    Animation(
      data.frames.map(
        (frame) =>
          new AnimationFrame(convertFrameToImage(frame), {
            duration: frame.frameDuration,
          })
      )
    )
  );

  for (const tag of data.tags) {
    let frames = data.frames.slice(tag.from, tag.to + 1);
    if (tag.animDirection === "Reverse") {
      frames.reverse();
    } else if (tag.animDirection === "Ping-pong") {
      frames = frames.concat(
        frames
          .slice(1)
          .reverse()
          .slice(1)
      );
    }

    animations[tag.name] = useNewComponent(() =>
      Animation(
        frames.map(
          (frame) =>
            new AnimationFrame(convertFrameToImage(frame), {
              duration: frame.frameDuration,
            })
        )
      )
    );
  }

  let currentAnim = animations.default;

  const { onEnabled, onDisabled } = useEnableDisable();

  onEnabled(() => {
    Object.values(animations).forEach((animation) => animation.enable());
  });

  onDisabled(() => {
    Object.values(animations).forEach((animation) => animation.disable());
  });

  /** Draw the current animation frame into the provided canvas context. */
  function draw(
    context: CanvasRenderingContext2D,
    {
      x = 0,
      y = 0,
    }: {
      x?: number | undefined;
      y?: number | undefined;
    } = {}
  ) {
    const frame = currentAnim.currentFrame.data;

    context.drawImage(frame, x, y);
  }

  return {
    /** The current animation, that frames will be drawn from. */
    get currentAnim() {
      return currentAnim;
    },
    set currentAnim(nextValue) {
      currentAnim = nextValue;
    },

    /** The aseprite-loader data that was passed into this function. */
    data,

    /**
     * All the animations that were found in the Aseprite file.
     *
     * We use Tags to find these, and also include an animation called "default" which
     * is the animation containing every frame in the file, in order.
     */
    animations,

    draw,

    /** The maximum size of the frames in this Aseprite file. */
    size,
  };
}
