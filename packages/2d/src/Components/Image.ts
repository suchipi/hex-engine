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

  drawIntoContext({
    context,
    targetX,
    targetY,
    sourceX = 0,
    sourceY = 0,
    sourceWidth = this.data?.width ?? 100,
    sourceHeight = this.data?.height ?? 100,
    targetWidth = this.data?.width ?? 100,
    targetHeight = this.data?.height ?? 100,
  }: {
    context: CanvasRenderingContext2D;
    targetX: number;
    targetY: number;
    sourceX?: void | number;
    sourceY?: void | number;
    sourceWidth?: void | number;
    sourceHeight?: void | number;
    targetWidth?: void | number;
    targetHeight?: void | number;
  }) {
    const data = this.data;
    if (data == null) return;

    context.drawImage(
      data,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      targetX,
      targetY,
      targetWidth,
      targetHeight
    );
  }
}

export default function ImageComponent(props: { url: string }) {
  useType(ImageComponent);
  return new Image(props);
}
