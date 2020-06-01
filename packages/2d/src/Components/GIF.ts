import { AnimationAPI, AnimationFrame } from './Animation';
import { useType } from '@hex-engine/core';
import gifken, { Gif } from 'gifken';

interface GIFInterface extends AnimationAPI<HTMLImageElement> {
  getGif(): Gif,
  drawCurrentFrame(context: CanvasRenderingContext2D, x?: number, y?: number): void;
}

export default function GIF(options: { 
  url: string, 
  width: number, 
  height: number, 
  fps?: number, 
  loop?: boolean 
}): GIFInterface {
  useType(GIF);
  let gif: Gif = new Gif();
  let frames: AnimationFrame<HTMLImageElement>[] = [];
  let play: boolean = false;
  let i = 0;

  load(options.url).then(async arrayBuffer => {
    gif = gifken.Gif.parse(arrayBuffer);
    frames = await getFrames({
        gif,
        width: options.width,
        height: options.height,
    })

    setInterval(() => {
      if (frames.length - 1 > i && play) {
        i++;
      }

      if(frames.length - 1 <= i && options.loop && play) {
        i = 0;
      }
    }, 1000 / (options.fps || 25))
  })

    
  return {
    getGif() {
      return gif;
    },
    drawCurrentFrame(context: CanvasRenderingContext2D, x: number = 0, y: number = 0) {
      if(frames.length !== 0 && play) {
          context.drawImage(frames[i].data, x, y);
      }
    },
    frames: frames,
    loop: options.loop || false, 
    currentFrameIndex: i,
    currentFrame: frames[i],
    currentFrameCompletion: 0,
    pause() {
      play = false;
    },
    resume() {
      play = true;
    },
    play() {
      play = true;
    },
    restart() {
      i = 0;
      play = true;
    },  
    goToFrame(frameNumber: number) {
      i = frameNumber;
    },
  }
}

/**
 * Load a gif.
 * @param url - gif url
 */
async function load(url: string) {
  return await fetch(url)
    .then((res) => res.arrayBuffer());
}

/**
 * Get all frames of a gif.
 * For the moment, it must use a tmp canvas to get each frames due to a bug of gitken.
 * See this issues: https://github.com/aaharu/gifken/issues/22
 */
async function getFrames({ gif, width, height }: {
  gif: Gif, 
  width?: number, 
  height?: number,
}): Promise<AnimationFrame<HTMLImageElement>[]> {
  const canvas: HTMLCanvasElement = document.createElement("canvas");
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D ;
  canvas.width = width || gif.width;
  canvas.height = height || gif.height;
  ctx.clearRect(0, 0, gif.width, gif.height);

  // get all frames as img
  const tmpImgs: HTMLImageElement[] = await Promise.all(gif.split(false).map((splited) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image(width || gif.width, height || gif.height);
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = gifken.GifPresenter.writeToDataUrl(splited.writeToArrayBuffer());
    })
  }));
  
  // draw frame to the tmp canvas and create the final frames.
  return tmpImgs.map((img: HTMLImageElement) => {
    ctx.drawImage(img, 0, 0);
    const newImg = new Image();
    newImg.src = canvas.toDataURL("image/gif");
    return new AnimationFrame<HTMLImageElement>(newImg, {
      duration: 0,
    });
  })
}