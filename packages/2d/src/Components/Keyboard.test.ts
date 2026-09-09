/// <reference types="@test-it/core/globals" />
import {
  Component,
  useChild,
  useNewComponent,
  useType,
} from "@hex-engine/core";
import Keyboard from "./Keyboard";
import { endGame, keyDown, keyUp, startGame, xy } from "./inputTestSetup";

type KeyboardApi = ReturnType<typeof Keyboard>;

afterEach(endGame);

function startWithKeyboard(
  options: Parameters<typeof Keyboard>[0] = {}
): KeyboardApi & Component {
  let keyboard!: KeyboardApi & Component;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);

      keyboard = useNewComponent(() => Keyboard(options));
    });
  });

  return keyboard;
}

test("pressed keys are tracked as they are held and released", () => {
  const keyboard = startWithKeyboard();

  expect([...keyboard.pressed]).toEqual([]);

  keyDown("a");
  expect([...keyboard.pressed]).toEqual(["a"]);

  keyDown("b");
  expect([...keyboard.pressed]).toEqual(["a", "b"]);

  keyUp("a");
  expect([...keyboard.pressed]).toEqual(["b"]);

  keyUp("b");
  expect([...keyboard.pressed]).toEqual([]);
});

test("key state updates synchronously, without waiting for a frame", () => {
  const keyboard = startWithKeyboard();

  keyDown("a");
  expect(keyboard.pressed.has("a")).toBe(true);
});

test("keys are tracked by their exact name, so case matters", () => {
  const keyboard = startWithKeyboard();

  keyDown("A");
  expect([...keyboard.pressed]).toEqual(["A"]);
  expect(keyboard.pressed.has("a")).toBe(false);

  keyUp("a");
  expect([...keyboard.pressed]).toEqual(["A"]);

  keyUp("A");
  expect([...keyboard.pressed]).toEqual([]);
});

test("auto-repeat events are ignored", () => {
  const keyboard = startWithKeyboard();

  keyDown("a");
  keyDown("a", { repeat: true });
  expect([...keyboard.pressed]).toEqual(["a"]);

  keyUp("a", { repeat: true });
  expect([...keyboard.pressed]).toEqual(["a"]);

  keyUp("a");
  expect([...keyboard.pressed]).toEqual([]);
});

test("preventDefault defaults to off for keydown", () => {
  startWithKeyboard();

  expect(keyDown("a")).toBe(false);
});

test("preventDefault: true prevents the default on keydown", () => {
  startWithKeyboard({ preventDefault: true });

  expect(keyDown("a")).toBe(true);
});

test("preventDefault defaults to off for keyup", () => {
  startWithKeyboard();

  expect(keyUp("a")).toBe(false);
});

test("preventDefault: true prevents the default on keyup", () => {
  startWithKeyboard({ preventDefault: true });

  expect(keyUp("a")).toBe(true);
});

test("each Keyboard Component tracks its own pressed keys", () => {
  let first!: KeyboardApi;
  let second!: KeyboardApi;

  startGame(() => {
    useChild(function First() {
      useType(First);
      first = useNewComponent(Keyboard);
    });
    useChild(function Second() {
      useType(Second);
      second = useNewComponent(Keyboard);
    });
  });

  keyDown("a");
  expect([...first.pressed]).toEqual(["a"]);
  expect([...second.pressed]).toEqual(["a"]);
  expect(first.pressed).not.toBe(second.pressed);
});

test("a disabled Keyboard stops tracking keys, and resumes when re-enabled", () => {
  const keyboard = startWithKeyboard();

  keyDown("a");
  expect([...keyboard.pressed]).toEqual(["a"]);

  keyboard.disable();
  keyDown("b");
  keyUp("a");
  expect([...keyboard.pressed]).toEqual(["a"]);

  keyboard.enable();
  keyDown("c");
  expect([...keyboard.pressed]).toEqual(["a", "c"]);
});

test("a Keyboard added after the game started tracks keys", () => {
  let late!: KeyboardApi;

  const root = startGame(() => {});

  keyDown("a");

  root.createChild(function Late() {
    useType(Late);
    late = useNewComponent(Keyboard);
  });

  keyDown("b");
  expect([...late.pressed]).toEqual(["b"]);
});

test("a destroyed Entity's Keyboard stops tracking keys", () => {
  let keyboard!: KeyboardApi;

  const root = startGame(() => {
    useChild(function Subject() {
      useType(Subject);
      keyboard = useNewComponent(Keyboard);
    });
  });

  keyDown("a");
  expect([...keyboard.pressed]).toEqual(["a"]);

  [...root.children][0].destroy();
  keyDown("b");
  expect([...keyboard.pressed]).toEqual(["a"]);
});

test("vectorFromKeys combines the four direction keys", () => {
  const keyboard = startWithKeyboard();

  const vector = () => xy(keyboard.vectorFromKeys("w", "s", "a", "d"));

  expect(vector()).toEqual({ x: 0, y: 0 });

  keyDown("d");
  expect(vector()).toEqual({ x: 1, y: 0 });

  keyDown("a");
  expect(vector()).toEqual({ x: 0, y: 0 });

  keyUp("d");
  expect(vector()).toEqual({ x: -1, y: 0 });

  keyDown("w");
  expect(vector()).toEqual({ x: -1, y: -1 });

  keyUp("w");
  keyDown("s");
  expect(vector()).toEqual({ x: -1, y: 1 });
});

test("vectorFromKeys also accepts the uppercase form of each key", () => {
  const keyboard = startWithKeyboard();

  const vector = () => xy(keyboard.vectorFromKeys("w", "s", "a", "d"));

  keyDown("D");
  expect(vector()).toEqual({ x: 1, y: 0 });

  keyUp("D");
  keyDown("W");
  expect(vector()).toEqual({ x: 0, y: -1 });
});

test("vectorFromKeys returns a new Vector each time", () => {
  const keyboard = startWithKeyboard();

  const first = keyboard.vectorFromKeys("w", "s", "a", "d");
  const second = keyboard.vectorFromKeys("w", "s", "a", "d");

  expect(first).not.toBe(second);
});

/**
 * Counts what a scene adds to and removes from the document over its whole
 * life, by shadowing the document's own methods.
 */
function countDocumentListeners(scene: () => void) {
  let added = 0;
  let removed = 0;

  const realAdd = document.addEventListener;
  const realRemove = document.removeEventListener;

  document.addEventListener = function (...args: Parameters<typeof realAdd>) {
    added++;
    return realAdd.apply(document, args);
  };
  document.removeEventListener = function (
    ...args: Parameters<typeof realRemove>
  ) {
    removed++;
    return realRemove.apply(document, args);
  };

  try {
    startGame(scene);
    endGame();
  } finally {
    delete (document as Partial<Document>).addEventListener;
    delete (document as Partial<Document>).removeEventListener;
  }

  return { added, removed };
}

test("the document gets one listener per event type no matter how many Keyboards listen", () => {
  const keyboards = (count: number) => () => {
    for (let index = 0; index < count; index++) {
      useChild(function Subject() {
        useType(Subject);
        useNewComponent(Keyboard);
      });
    }
  };

  // Whatever else the Canvas puts on the document is not this test's business,
  // so measure Keyboard's contribution against a scene that has none.
  const none = countDocumentListeners(keyboards(0));
  const one = countDocumentListeners(keyboards(1));
  const many = countDocumentListeners(keyboards(50));

  expect(one.added - none.added).toBe(2);
  expect(many.added).toBe(one.added);
  expect(many.removed - none.removed).toBe(2);
});
