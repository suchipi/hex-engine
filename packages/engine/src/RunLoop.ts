export default class RunLoop {
  onFrame: (delta: number) => void;
  frameRequest: number | null = null;
  running: boolean = false;
  lastTimestamp: number | null = null;

  constructor(onFrame: (delta: number) => void) {
    this.onFrame = onFrame;
  }

  start() {
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
    this.running = true;
  }

  stop() {
    if (this.frameRequest != null) {
      cancelAnimationFrame(this.frameRequest);
    }
    this.running = false;
  }
}
