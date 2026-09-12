import { useType } from "@hex-engine/core";
import Preloader from "../Preloader";

type Props = {
  url: string;
};

const cache: { [url: string]: Audio } = {};

class Audio {
  url: string;
  _loadingPromise: Promise<void> | null = null;
  loaded: boolean = false;
  data: HTMLAudioElement | null = null;

  constructor(config: Props) {
    this.url = config.url;

    if (cache[config.url]) {
      return cache[config.url];
    }

    // Cached before loading rather than after, so that anything else asking for
    // this url while it is still in flight waits on this load instead of
    // starting its own.
    cache[config.url] = this;

    Preloader.addTask(() => this.load());
  }

  /**
   * Load this Audio file. Note that Audio files automatically start loading when they are created,
   * and no errors are thrown if you attempt to play an Audio file that hasn't loaded yet, so
   * in most cases, you do not need to call this function.
   */
  load(): Promise<void> {
    if (this.loaded) return Promise.resolve();
    if (this._loadingPromise) return this._loadingPromise;

    this._loadingPromise = new Promise<void>((resolve, reject) => {
      const image = document.createElement("audio");
      image.oncanplaythrough = () => {
        this.loaded = true;
        this.data = image;
        resolve();
      };
      image.onerror = (event) => {
        // Uncached again, so that a url which failed can be retried rather
        // than handing back a broken Audio for the life of the page.
        delete cache[this.url];

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

  /** Play this audio clip, if it's loaded. If it isn't loaded yet, nothing will happen. */
  play({
    volume,
  }: {
    /** Specify the playback volume, from 0 to 1. */
    volume?: number;
  } = {}): Promise<void> {
    const data = this.data;
    if (!data) return Promise.resolve();

    if (volume != null) {
      data.volume = volume;
    }
    return data.play();
  }
}

/**
 * A function that loads and plays a sound clip from a URL.
 *
 * You can get a URL for a sound clip by `import`ing it, as if it was code:
 *
 * ```ts
 * import mySound from "./my-sound.ogg";
 *
 * console.log(typeof mySound); // "string"
 *
 * useNewComponent(() => Audio({ url: mySound }));
 * ```
 *
 * When you import an audio clip in this way, it will be automatically
 * added to the build and included in the final build output.
 */
export default function AudioComponent({ url }: Props) {
  useType(AudioComponent);

  // Wrapped rather than returned directly, because a class instance cannot be
  // merged onto a Component.
  const audio = new Audio({ url });

  return {
    /** The url this Audio was loaded from. */
    get url() {
      return audio.url;
    },

    /** Whether the audio has finished loading yet. */
    get loaded() {
      return audio.loaded;
    },

    /** The loaded audio element, or null if it has not loaded yet. */
    get data() {
      return audio.data;
    },

    load: () => audio.load(),

    play: (...args: Parameters<typeof audio.play>): Promise<void> =>
      audio.play(...args),
  };
}
