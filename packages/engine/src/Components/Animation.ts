import BaseComponent, { ComponentConfig } from "../Component";
import Timer from "./Timer";
import Entity from "../Entity";

class Frame<Data> {
  data: Data;
  animationEvents: Array<string>;

  constructor(data: Data, animationEvents: Array<string>) {
    this.data = data;
    this.animationEvents = animationEvents;
  }
}

export default class Animation<FrameData> extends BaseComponent {
  static Frame = Frame;

  frames: Array<Frame<FrameData>>;
  duration: number;
  timer: Timer;
  _currentFrameIndex: number;

  get currentFrame() {
    return this.frames[this._currentFrameIndex];
  }

  constructor(
    config: Partial<ComponentConfig> & {
      frames: Array<FrameData | Frame<FrameData>>;
      duration: number; // ms per frame
    }
  ) {
    super(config);
    this.frames = config.frames.map((frame) => {
      if (frame instanceof Frame) {
        return frame;
      } else {
        return new Frame(frame, []);
      }
    });
    this.duration = config.duration;
    this.timer = new Timer();
    this.timer.disable();
    this._currentFrameIndex = 0;
  }

  onEntityReceived(ent: Entity | null) {
    ent?.addComponent(this.timer);
  }

  pause() {
    this.timer.disable();
  }

  play() {
    this.timer.enable();
    this.timer.set(this.duration);
  }

  restart() {
    this._currentFrameIndex = 0;
  }

  update(_delta: number) {
    if (this.timer.delta() > 0) {
      this.timer.set(this.duration);

      if (this._currentFrameIndex === this.frames.length - 1) {
        this._currentFrameIndex = 0;
      } else {
        this._currentFrameIndex++;
      }

      if (this.currentFrame.animationEvents.length > 0) {
        this.currentFrame.animationEvents.forEach((animationEvent) => {
          this.entity?.emit("animation-event", animationEvent);
        });
      }
    }
  }
}
