import { useType } from "@hex-engine/core";

/**
 * This Component uses the canvas `getImageData` and `putImageData` APIs
 * to filter the contents of a Canvas by passing it through a filter function.
 *
 * Note: `getImageData` and `putImageData` are very slow, so if you can,
 * try not to call this every frame.
 *
 * @param filter A function that will receive an ImageData object, and can mutate it as desired.
 */
export default function ImageFilter(filter: (data: ImageData) => void) {
  useType(ImageFilter);

  return {
    /**
     * Reads the pixels in `input` into an ImageData object, passes that `ImageData`
     * object into the filter this ImageFilter Component was constructed with,
     * and then writes the pixels in the ImageData object into `output`.
     */
    apply(input: CanvasRenderingContext2D, output: CanvasRenderingContext2D) {
      const imageData = input.getImageData(
        0,
        0,
        input.canvas.width,
        input.canvas.height
      );
      filter(imageData);
      input.putImageData(imageData, 0, 0);
      output.drawImage(input.canvas, 0, 0);
    },
  };
}
