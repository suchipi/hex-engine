/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import AudioContextComponent from "./AudioContext";
import ProceduralSfx from "./ProceduralSfx";
import { useUpdate } from "../Hooks";
import { endGame, mouseDown, startGame, step } from "./inputTestSetup";

const MODES = [
  { frequency: 440, amplitude: 1, decay: 2 },
  { frequency: 880, amplitude: 0.5, decay: 1 },
];

let warnings: Array<unknown> = [];
let realWarn: typeof console.warn;

beforeEach(() => {
  warnings = [];
  realWarn = console.warn;
  console.warn = (...args: Array<unknown>) => {
    warnings.push(args[0]);
  };
});

afterEach(() => {
  console.warn = realWarn;
  endGame();
});

type PlayOptions = Parameters<ReturnType<typeof ProceduralSfx>["play"]>[0];

/**
 * ProceduralSfx.play reads the AudioContext through a hook, so it can only be
 * called from somewhere that has a Component bound. This runs it from an update
 * callback, which is where a game would call it from.
 */
function startWithSfx({
  withAudioContext = true,
}: { withAudioContext?: boolean } = {}) {
  let sfx!: ReturnType<typeof ProceduralSfx>;
  let toPlay: null | PlayOptions | undefined = undefined;

  startGame(() => {
    if (withAudioContext) {
      useNewComponent(AudioContextComponent);
    }

    useChild(function Subject() {
      useType(Subject);
      sfx = useNewComponent(() => ProceduralSfx(MODES));

      useUpdate(() => {
        if (toPlay !== undefined) {
          const options = toPlay;
          toPlay = undefined;
          sfx.play(options ?? undefined);
        }
      });
    });
  });

  // The first click is latched for the life of the page, so every test here
  // starts from "the user has already interacted". It has to happen after
  // startGame, because the click needs a canvas to land on.
  mouseDown(1, 1);

  return {
    get sfx() {
      return sfx;
    },
    /** Queues a play() for the next frame, and runs that frame. */
    play(options: PlayOptions = undefined) {
      toPlay = options ?? null;
      step();
    },
  };
}

// The not-yet-interacted-with case lives in
// ProceduralSfx-beforeInteraction.test.ts, since the first click cannot be
// taken back once any test here has made it.
test("synthesis is built on the frame after the AudioContext exists", () => {
  const subject = startWithSfx();

  expect(subject.sfx.synthesis).toBe(null);

  step();

  expect(subject.sfx.synthesis).not.toBe(null);
});

test("playing once the synthesis exists does not warn", () => {
  const subject = startWithSfx();
  step();

  subject.play();

  expect(warnings).toEqual([]);
});

test("play accepts multipliers for the waves", () => {
  const subject = startWithSfx();
  step();

  subject.play({
    amplitudeMultiplier: 0.5,
    frequencyMultiplier: (index: number) => 1 + index * 0.1,
    decayMultiplier: 2,
    whiteNoiseDuration: 5,
  });

  expect(warnings).toEqual([]);
});

test("known quirk: with no AudioContext Component, playing warns about the user not having clicked", () => {
  const subject = startWithSfx({ withAudioContext: false });

  step();
  expect(subject.sfx.synthesis).toBe(null);

  subject.play();

  // The page has definitely been clicked by now; the only thing missing is the
  // AudioContext Component. The message leads with the other explanation and
  // only mentions this one at the end.
  expect(warnings.length).toBe(1);
  expect(String(warnings[0])).toContain("hasn't interacted with the page yet");
});

test("the warning is only printed once, however often play is called", () => {
  const subject = startWithSfx({ withAudioContext: false });
  step();

  subject.play();
  subject.play();
  subject.play();

  expect(warnings.length).toBe(1);
});
