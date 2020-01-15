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

export default function ImageComponent(props: { url: string }) {
  useType(ImageComponent);
  return new Image(props);
}
