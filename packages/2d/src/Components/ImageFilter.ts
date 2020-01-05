import { useType } from "@hex-engine/core";

export default function ImageFilter(transform: (data: ImageData) => void) {
  useType(ImageFilter);

  return {
    apply(input: CanvasRenderingContext2D, output: CanvasRenderingContext2D) {
      const imageData = input.getImageData(
        0,
        0,
        input.canvas.width,
        input.canvas.height
      );
      transform(imageData);
      output.putImageData(imageData, 0, 0);
    },
  };
}
