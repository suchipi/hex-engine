import { useType } from "@hex-engine/core";
import Preloader from "../Preloader";

const cache: { [url: string]: Image } = {};

class Image {
  url: string;
  _loadingPromise: Promise<void> | null = null;
  loaded: boolean = false;
  data: HTMLImageElement | null = null;

  constructor(config: { url: string }) {
    this.url = config.url;

    if (cache[config.url]) {
      return cache[config.url];
    }

    Preloader.addTask(() => this.load());
  }

  /**
   * Load this Image file. Note that Image files automatically start loading when they are created,
   * and no errors are thrown if you attempt to draw an Image file that hasn't loaded yet, so
   * in most cases, you do not need to call this function.
   */
  load(): Promise<void> {
    if (this.loaded) return Promise.resolve();
    if (this._loadingPromise) return this._loadingPromise;

    this._loadingPromise = new Promise((resolve, reject) => {
      const image = document.createElement("img");
      image.onload = () => {
        this.loaded = true;
        this.data = image;
        cache[this.url] = this;
        resolve();
      };
      image.onerror = (event) => {
        const error = new Error("Failed to load image");
        // @ts-ignore
        error.event = event;
        reject(error);
      };

      image.src = this.url;
    }).then(() => {
      this._loadingPromise = null;
    });

    return this._loadingPromise;
  }

  /** Draw the Image into the provided canvas context, if it has been loaded. */
  draw(
    context: CanvasRenderingContext2D,
    {
      x,
      y,
      sourceX = 0,
      sourceY = 0,
      sourceWidth = this.data?.width ?? 100,
      sourceHeight = this.data?.height ?? 100,
      targetWidth = this.data?.width ?? 100,
      targetHeight = this.data?.height ?? 100,
    }: {
      x: number;
      y: number;
      sourceX?: undefined | number;
      sourceY?: undefined | number;
      sourceWidth?: undefined | number;
      sourceHeight?: undefined | number;
      targetWidth?: undefined | number;
      targetHeight?: undefined | number;
    }
  ) {
    const data = this.data;
    if (data == null) return;

    if (
      sourceWidth === 0 ||
      sourceHeight === 0 ||
      targetWidth === 0 ||
      targetHeight === 0
    ) {
      return;
    }

    context.drawImage(
      data,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      x,
      y,
      targetWidth,
      targetHeight
    );
  }
}

/**
 * A function that loads and draws an image from a URL.
 *
 * You can get a URL for an image on disk by `import`ing it, as if it was code:
 *
 * ```ts
 * import myImage from "./my-image.png";
 *
 * console.log(typeof myImage); // "string"
 *
 * useNewComponent(() => Image({ url: myImage }));
 * ```
 *
 * When you import an image in this way, it will be automatically
 * added to the build and included in the final build output.
 */
export default function ImageComponent(options: { url: string }) {
  useType(ImageComponent);
  return new Image(options);
}
