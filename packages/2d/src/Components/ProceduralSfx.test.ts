/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import AudioContextComponent from "./AudioContext";
import ProceduralSfx from "./ProceduralSfx";
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

function startWithSfx({
  withAudioContext = true,
}: { withAudioContext?: boolean } = {}) {
  let sfx!: ReturnType<typeof ProceduralSfx>;

  startGame(() => {
    if (withAudioContext) {
      useNewComponent(AudioContextComponent);
    }

    useChild(function Subject() {
      useType(Subject);
      sfx = useNewComponent(() => ProceduralSfx(MODES));
    });
  });

  // The first click is latched for the life of the page, so every test here
  // starts from "the user has already interacted". It has to happen after
  // startGame, because the click needs a canvas to land on. The
  // not-yet-interacted-with case lives in
  // ProceduralSfx-beforeInteraction.test.ts.
  mouseDown(1, 1);

  return sfx;
}

test("synthesis is built on the frame after the AudioContext exists", () => {
  const sfx = startWithSfx();

  expect(sfx.synthesis).toBe(null);

  step();

  expect(sfx.synthesis).not.toBe(null);
});

test("play can be called from outside any Component", () => {
  const sfx = startWithSfx();
  step();

  expect(() => sfx.play()).not.toThrowError();
  expect(warnings).toEqual([]);
});

test("play accepts multipliers for the waves", () => {
  const sfx = startWithSfx();
  step();

  expect(() =>
    sfx.play({
      amplitudeMultiplier: 0.5,
      frequencyMultiplier: (index: number) => 1 + index * 0.1,
      decayMultiplier: 2,
      whiteNoiseDuration: 5,
    })
  ).not.toThrowError();

  expect(warnings).toEqual([]);
});

test("play works from a DOM event handler", () => {
  const sfx = startWithSfx();
  step();

  let error: unknown = null;
  const button = document.createElement("button");
  button.addEventListener("click", () => {
    try {
      sfx.play();
    } catch (caught) {
      error = caught;
    }
  });

  document.body.appendChild(button);
  try {
    button.click();
  } finally {
    button.remove();
  }

  expect(error).toBe(null);
  expect(warnings).toEqual([]);
});

test("known quirk: with no AudioContext Component, playing warns about the user not having clicked", () => {
  const sfx = startWithSfx({ withAudioContext: false });

  step();
  expect(sfx.synthesis).toBe(null);

  sfx.play();

  // The page has definitely been clicked by now; the only thing missing is the
  // AudioContext Component. The message leads with the other explanation and
  // only mentions this one at the end.
  expect(warnings.length).toBe(1);
  expect(String(warnings[0])).toContain("hasn't interacted with the page yet");
});

test("the warning is only printed once, however often play is called", () => {
  const sfx = startWithSfx({ withAudioContext: false });
  step();

  sfx.play();
  sfx.play();
  sfx.play();

  expect(warnings.length).toBe(1);
});
