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
    compressed?: boolean, 
    loop?: boolean 
}): GIFInterface {
    useType(GIF);
    let gif: Gif = new Gif();
    let frames: AnimationFrame<HTMLImageElement>[] = [];
    let play: boolean = false;
    let i = 0;

    load(options.url).then(arrayBuffer => {
        gif = gifken.Gif.parse(arrayBuffer);
        frames = getFrames({
            gif,
            width: options.width,
            height: options.height,
            compressed: options.compressed
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

async function load(url: string) {
    return await fetch(url)
        .then((res) => res.arrayBuffer());
}

function getFrames({ gif, width, height, compressed = false }: {
    gif: Gif, 
    width: number, 
    height: number,
    compressed?: boolean,
}){
    return gif.split(compressed).map(frame => {
        const blob = gifken.GifPresenter.writeToBlob(frame.writeToArrayBuffer())
        const url = URL.createObjectURL(blob).toString();
        const img = document.createElement('img');
        img.width = width;
        img.height = height;
        img.src = url;
        return new AnimationFrame<HTMLImageElement>(img, {
            duration: 0,
        });
    });
}