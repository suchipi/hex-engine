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

test("buttons with no name of their own are told apart by their index", () => {
  const gamepad = startWithGamepad({ buttonNames: ["jump"] });

  connected = [pad([0, 0, 0, 0], [5])];
  step();
  expect([...gamepad.pressed]).toEqual(["unknown button 5"]);

  connected = [pad([0, 0, 0, 0], [5, 16])];
  step();
  expect([...gamepad.pressed].sort()).toEqual([
    "unknown button 16",
    "unknown button 5",
  ]);
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

test("a stick resting inside the deadzone reads as centered", () => {
  const gamepad = startWithGamepad({ deadzone: 0.5 });

  connected = [pad([0.1, -0.4, 0.49, 0.2])];
  step();

  expect(xy(gamepad.leftStick)).toEqual({ x: 0, y: 0 });
  expect(xy(gamepad.rightStick)).toEqual({ x: 0, y: 0 });
});

test("a stick pushed past the deadzone reports its real position", () => {
  const gamepad = startWithGamepad({ deadzone: 0.5 });

  connected = [pad([0.8, -0.6, 0.5, 0])];
  step();

  expect(gamepad.leftStick.x).toBe(0.8);
  expect(gamepad.leftStick.y).toBe(-0.6);
  // The deadzone is a minimum to clear, so exactly at it still counts.
  expect(gamepad.rightStick.x).toBe(0.5);
});

test("the deadzone defaults to a small value rather than zero", () => {
  const gamepad = startWithGamepad();

  expect(gamepad.deadzone).toBe(0.1);

  connected = [pad([0.05, 0, 0, 0])];
  step();
  expect(gamepad.leftStick.x).toBe(0);
});

test("unplugging a pad resets it to rest", () => {
  const gamepad = startWithGamepad();

  connected = [pad([0.9, 0.9, 0, 0], [0])];
  step();
  expect([...gamepad.pressed]).toEqual(["cross"]);

  connected = [];
  step();

  // Otherwise the game would keep being told a button is held on a controller
  // that is no longer there.
  expect(gamepad.present).toBe(false);
  expect([...gamepad.pressed]).toEqual([]);
  expect(xy(gamepad.leftStick)).toEqual({ x: 0, y: 0 });
  expect(xy(gamepad.rightStick)).toEqual({ x: 0, y: 0 });
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
