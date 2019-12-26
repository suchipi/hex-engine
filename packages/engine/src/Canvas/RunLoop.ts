import BaseComponent, { ComponentConfig } from "../Component";

type Data = {
  onFrame: (delta: number) => void;
};

export default class RunLoop extends BaseComponent {
  onFrame: (delta: number) => void;
  frameRequest: number | null = null;
  lastTimestamp: number | null = null;

  constructor(data: Data & Partial<ComponentConfig>) {
    super(data);
    this.onFrame = data.onFrame;
  }

  onEnabled() {
    const tick = (timestamp: number) => {
      if (this.lastTimestamp) {
        const delta = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;
        this.onFrame(delta);
      } else {
        this.lastTimestamp = timestamp;
      }
      this.frameRequest = requestAnimationFrame(tick);
    };
    this.frameRequest = requestAnimationFrame(tick);
  }

  onDisabled() {
    if (this.frameRequest != null) {
      cancelAnimationFrame(this.frameRequest);
    }
  }
}
