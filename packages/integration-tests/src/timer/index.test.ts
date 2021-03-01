/// <reference types="@test-it/core/globals" />
import {
  Canvas,
  useNewComponent,
  useType,
  createRoot,
  Timer,
  RunLoop,
} from "@hex-engine/2d";

describe("timer", () => {
  function Root() {
    useType(Root);

    const canvas = useNewComponent(() => Canvas({ backgroundColor: "white" }));
    canvas.setPixelated(true);
    canvas.fullscreen();

    const timer1 = useNewComponent(Timer);
    const timer2 = useNewComponent(Timer);

    return {
      timer1,
      timer2,
    };
  }

  let timer1;
  let timer2;
  let runLoop;
  beforeEach(() => {
    const rootEnt = createRoot(Root);
    ({ timer1, timer2 } = rootEnt.rootComponent);

    runLoop = rootEnt.getComponent(RunLoop)!;
    runLoop.pause();
  });

  test("When no time has been set, alpha and unclampedAlpha are both 1", () => {
    expect(timer1.alpha).toBe(1);
    expect(timer2.alpha).toBe(1);
    expect(timer1.unclampedAlpha).toBe(1);
    expect(timer2.unclampedAlpha).toBe(1);
  });

  test("Immediately after setting a time, alpha and unclampedAlpha are both 0", () => {
    timer1.setToTimeFromNow(10);
    timer2.setToTimeFromNow(1000);

    expect(timer1.alpha).toBe(0);
    expect(timer2.alpha).toBe(0);
    expect(timer1.unclampedAlpha).toBe(0);
    expect(timer2.unclampedAlpha).toBe(0);
  });

  test("alpha progresses between 0 and 1", () => {
    timer1.setToTimeFromNow(10);
    timer2.setToTimeFromNow(1000);

    runLoop.step(5);

    expect(timer1.alpha).toBe(0.5);
    expect(timer1.unclampedAlpha).toBeCloseTo(0.5, 6);
    expect(timer2.alpha).toBeCloseTo(0.005, 6);
    expect(timer2.unclampedAlpha).toBeCloseTo(0.005, 6);

    runLoop.step(5);

    expect(timer1.alpha).toBe(1);
    expect(timer1.unclampedAlpha).toBe(1);
    expect(timer2.alpha).toBeCloseTo(0.01, 6);
    expect(timer2.unclampedAlpha).toBeCloseTo(0.01, 6);

    runLoop.step(5);

    expect(timer1.alpha).toBe(1);
    expect(timer1.unclampedAlpha).toBeCloseTo(1.5, 6);
    expect(timer2.alpha).toBeCloseTo(0.015, 6);
    expect(timer2.unclampedAlpha).toBeCloseTo(0.015, 6);

    runLoop.step(1000);
    expect(timer1.alpha).toBe(1);
    expect(timer1.unclampedAlpha).toBeCloseTo(101.5, 6);
    expect(timer2.alpha).toBe(1);
    expect(timer2.unclampedAlpha).toBeCloseTo(1.015, 6);
  });
});
