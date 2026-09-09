/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import Gamepad from "./Gamepad";
import { endGame, startGame, step, xy } from "./inputTestSetup";

type FakeGamepad = {
  axes: Array<number>;
  buttons: Array<{ pressed: boolean }>;
};

let connected: Array<FakeGamepad | null> = [];
let realGetGamepads: typeof navigator.getGamepads;

function pad(
  axes: Array<number> = [0, 0, 0, 0],
  pressedIndices: Array<number> = []
): FakeGamepad {
  return {
    axes,
    buttons: Array.from({ length: 17 }, (_unused, index) => ({
      pressed: pressedIndices.includes(index),
    })),
  };
}

beforeEach(() => {
  connected = [];
  realGetGamepads = navigator.getGamepads;
  navigator.getGamepads = (() =>
    connected) as unknown as typeof navigator.getGamepads;
});

afterEach(() => {
  navigator.getGamepads = realGetGamepads;
  endGame();
});

function startWithGamepad(
  options: Parameters<typeof Gamepad>[0] = {}
): ReturnType<typeof Gamepad> {
  let gamepad!: ReturnType<typeof Gamepad>;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);
      gamepad = useNewComponent(() => Gamepad(options));
    });
  });

  return gamepad;
}

test("a Gamepad reports itself absent until a pad shows up", () => {
  const gamepad = startWithGamepad();

  step();
  expect(gamepad.present).toBe(false);

  connected = [pad()];
  step();
  expect(gamepad.present).toBe(true);
});

test("the sticks follow the first four axes", () => {
  const gamepad = startWithGamepad();

  connected = [pad([0.5, -0.25, -1, 1])];
  step();

  expect(xy(gamepad.leftStick)).toEqual({ x: 0.5, y: -0.25 });
  expect(xy(gamepad.rightStick)).toEqual({ x: -1, y: 1 });
});

test("pressed buttons are reported by name", () => {
  const gamepad = startWithGamepad();

  connected = [pad([0, 0, 0, 0], [0, 9])];
  step();

  expect([...gamepad.pressed].sort()).toEqual(["cross", "start"]);
});

test("releasing a button takes it back out of the pressed set", () => {
  const gamepad = startWithGamepad();

  connected = [pad([0, 0, 0, 0], [0])];
  step();
  expect([...gamepad.pressed]).toEqual(["cross"]);

  connected = [pad([0, 0, 0, 0], [])];
  step();
  expect([...gamepad.pressed]).toEqual([]);
});

test("custom button names replace the PlayStation defaults", () => {
  const gamepad = startWithGamepad({ buttonNames: ["jump", "shoot"] });

  connected = [pad([0, 0, 0, 0], [1])];
  step();

  expect([...gamepad.pressed]).toEqual(["shoot"]);
});

test("known quirk: every unnamed button shares one name, so they cancel each other out", () => {
  const gamepad = startWithGamepad({ buttonNames: ["jump"] });

  // Buttons are walked in index order, adding or deleting their name. Every
  // button past the named ones is called "unknown button", so a later released
  // one deletes the entry an earlier pressed one just added.
  connected = [pad([0, 0, 0, 0], [5])];
  step();
  expect([...gamepad.pressed]).toEqual([]);

  // Only the very last button escapes, because nothing comes after it.
  connected = [pad([0, 0, 0, 0], [16])];
  step();
  expect([...gamepad.pressed]).toEqual(["unknown button"]);
});

test("gamepadIndex chooses which connected pad to read", () => {
  const gamepad = startWithGamepad({ gamepadIndex: 1 });

  connected = [pad([0, 0, 0, 0], [0]), pad([0, 0, 0, 0], [1])];
  step();

  expect([...gamepad.pressed]).toEqual(["circle"]);
});

test("state does not change until a frame runs", () => {
  const gamepad = startWithGamepad();

  connected = [pad([0.5, 0, 0, 0], [0])];

  expect(gamepad.present).toBe(false);
  expect([...gamepad.pressed]).toEqual([]);

  step();

  expect(gamepad.present).toBe(true);
});

test("known quirk: the deadzone option is stored but never applied", () => {
  const gamepad = startWithGamepad({ deadzone: 0.5 });

  connected = [pad([0.1, 0.1, 0.1, 0.1])];
  step();

  // Nothing in the update reads state.deadzone, so a stick resting slightly off
  // center still reports that offset, however large the deadzone is set.
  expect(gamepad.deadzone).toBe(0.5);
  expect(xy(gamepad.leftStick)).toEqual({ x: 0.1, y: 0.1 });
});

test("known quirk: unplugging a pad leaves its buttons stuck down", () => {
  const gamepad = startWithGamepad();

  connected = [pad([0.9, 0.9, 0, 0], [0])];
  step();
  expect([...gamepad.pressed]).toEqual(["cross"]);

  connected = [];
  step();

  // The update returns as soon as it finds no gamepad, without clearing what it
  // last saw, so the game keeps being told the button is held.
  expect(gamepad.present).toBe(false);
  expect([...gamepad.pressed]).toEqual(["cross"]);
  expect(xy(gamepad.leftStick)).toEqual({ x: 0.9, y: 0.9 });
});

test("a disabled Gamepad stops updating", () => {
  let gamepad!: ReturnType<typeof Gamepad> & { disable(): void };

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);
      gamepad = useNewComponent(Gamepad);
    });
  });

  gamepad.disable();
  connected = [pad([0, 0, 0, 0], [0])];
  step();

  expect(gamepad.present).toBe(false);
  expect([...gamepad.pressed]).toEqual([]);
});
