import { AnimationAPI, AnimationFrame } from './Animation';
import { useType } from '@hex-engine/core';
import gifken from 'gifken';

interface GIFInterface extends AnimationAPI<{}> {
    drawCurrentFrame(context: CanvasRenderingContext2D): void;
}

export default function GIF(options: { url: string }): GIFInterface {
    useType(GIF);
    let frames: any[] = [];
    let i = 0;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", options.url, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = (e: any) => {
        var arrayBuffer = e.target["response"];
        var gif = gifken.Gif.parse(arrayBuffer);

        frames = gif.split(false).map(frame => {
            const url = URL.createObjectURL(new Blob(frame.writeToArrayBuffer())).toString();
            const img = document.createElement('img');
            img.src = url;
            return img
        })
    };
    xhr.send();

    return {
        drawCurrentFrame(context: CanvasRenderingContext2D) {
            if(frames.length !== 0) {
                context.drawImage(frames[i], 0, 0);
                if(frames.length - 1 > i) {
                    i++;
                }
            }
        },
        frames: [],
        loop: false, 
        currentFrameIndex: 0,
        currentFrame: new AnimationFrame({}, {
            duration: 0,
        }),
        currentFrameCompletion: 0,
        pause() {
            return void 0;
        },
        resume() {
            return void 0;
        },
        play() {
            return void 0;
        },
        restart() {
            return void 0;
        },  
        goToFrame(frameNumber: number) {
            return frameNumber;
        },
    }
}