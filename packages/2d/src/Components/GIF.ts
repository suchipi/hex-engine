import { AnimationAPI, AnimationFrame } from './Animation';
import { useType } from '@hex-engine/core';

export default function GIF(): AnimationAPI<unknown> {
    useType(GIF);

    return {
        frames: [],
        loop: false, 
        currentFrameIndex: 0,
        currentFrame: new AnimationFrame(null, {
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
            return void 0;
        },
    }
}