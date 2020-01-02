import { useType } from "@hex-engine/core";
import Preloader from "../Preloader";

type Props = {
  url: string;
};

class Audio {
  url: string;
  _loadingPromise: Promise<void> | null = null;
  loaded: boolean = false;
  data: HTMLAudioElement | null = null;

  constructor(config: Props) {
    this.url = config.url;

    Preloader.addTask(() => this.load());
  }

  load(): Promise<void> {
    if (this.loaded) return Promise.resolve();
    if (this._loadingPromise) return this._loadingPromise;

    this._loadingPromise = new Promise((resolve, reject) => {
      const image = document.createElement("audio");
      image.oncanplaythrough = () => {
        this.loaded = true;
        this.data = image;
        resolve();
      };
      image.onerror = (event) => {
        const error = new Error("Failed to load audio");
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

  play({ volume }: { volume?: number } = {}): Promise<void> {
    const data = this.data;
    if (!data) return Promise.resolve();

    if (volume != null) {
      data.volume = volume;
    }
    return data.play();
  }
}

export default function AudioComponent({ url }: Props) {
  useType(AudioComponent);

  return new Audio({ url });
}
