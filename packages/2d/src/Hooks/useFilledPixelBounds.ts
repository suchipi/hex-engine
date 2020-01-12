export default function useFilledPixelBounds(
  context: CanvasRenderingContext2D
) {
  const imageData = context.getImageData(
    0,
    0,
    context.canvas.width,
    context.canvas.height
  );
  const pixels = imageData.data;
  let minX = Infinity;
  let maxX = 0;
  let minY = Infinity;
  let maxY = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const pixelIndex = i / 4;

    const alpha = pixels[i + 3];
    if (alpha > 0) {
      const x = pixelIndex % imageData.width;
      if (x < minX) {
        minX = x;
      }
      if (x > maxX) {
        maxX = x;
      }

      const y = Math.floor(pixelIndex / imageData.width);
      if (y < minY) {
        minY = y;
      }
      if (y > maxY) {
        maxY = y;
      }
    }
  }

  if (maxX === 0 && minX === Infinity && maxY === 0 && minY === Infinity) {
    throw new Error(
      "Tried to get filled pixel bounds, but there were no filled pixels"
    );
  }

  return {
    minX,
    maxX,
    minY,
    maxY,
  };
}
