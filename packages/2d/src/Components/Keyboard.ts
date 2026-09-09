import {
  useEnableDisable,
  useType,
  useCallbackAsCurrent,
  useRootEntity,
  useNewRootComponent,
} from "@hex-engine/core";
import { Vector } from "../Models";
import { useContext } from "../Hooks";

let firstKeyHasHappened = false;
let pendingFirstKeyHandlers: Array<() => void> = [];

function runFirstKeyHandlers() {
  if (firstKeyHasHappened) return;

  firstKeyHasHappened = true;
  pendingFirstKeyHandlers.forEach((handler) => {
    handler();
  });
  pendingFirstKeyHandlers = [];
}

/**
 * This function will run the provided function the first time a key is pressed.
 * If the first keypress has already happened, the function is run immediately.
 *
 * Note that it only works if there is at least one `Keyboard` Component loaded in
 * your game when the first keypress occurs. To be on the safe side, you should
 * probably also add a Keyboard Component to the Component that calls useFirstKey.
 */
export function useFirstKey(handler: () => void) {
  const wrappedHandler = useCallbackAsCurrent(handler);

  if (firstKeyHasHappened) {
    wrappedHandler();
  } else {
    pendingFirstKeyHandlers.push(wrappedHandler);
  }

  return {
    /** Whether the first keypress has happened yet. */
    get firstKeyHasHappened() {
      return firstKeyHasHappened;
    },
  };
}

type KeyboardEventType = "keydown" | "keyup";

type KeyboardEventHandler = (
  type: KeyboardEventType,
  event: KeyboardEvent
) => void;

/**
 * Owns the document's key listeners on behalf of every `Keyboard` Component, so
 * that the number of DOM listeners stays the same whether the game has one
 * Component watching the keyboard or a thousand.
 */
function StorageForKeyboard() {
  useType(StorageForKeyboard);

  const { canvas } = useContext();
  const doc = canvas.ownerDocument;
  if (!doc) {
    throw new Error(
      "Root canvas is not part of a document; therefore, Keyboard can't setup event listeners"
    );
  }

  const handlers = new Set<KeyboardEventHandler>();

  const processKeydown = (event: KeyboardEvent) => {
    runFirstKeyHandlers();
    handlers.forEach((handler) => handler("keydown", event));
  };

  const processKeyup = (event: KeyboardEvent) => {
    handlers.forEach((handler) => handler("keyup", event));
  };

  let bound = false;

  function bindListeners() {
    if (bound) return;
    doc.addEventListener("keydown", processKeydown);
    doc.addEventListener("keyup", processKeyup);
    bound = true;
  }

  function unbindListeners() {
    if (!bound) return;
    doc.removeEventListener("keydown", processKeydown);
    doc.removeEventListener("keyup", processKeyup);
    bound = false;
  }

  const enableDisable = useEnableDisable();

  enableDisable.onEnabled(() => {
    if (handlers.size > 0) bindListeners();
  });

  enableDisable.onDisabled(unbindListeners);

  return {
    addHandler(handler: KeyboardEventHandler) {
      handlers.add(handler);
      if (enableDisable.isEnabled) bindListeners();
    },
    removeHandler(handler: KeyboardEventHandler) {
      handlers.delete(handler);
      if (handlers.size === 0) unbindListeners();
    },
  };
}

/**
 * This Component provides information about which keys on the user's
 * Keyboard are currently pressed.
 */
export default function Keyboard({
  preventDefault = false,
}: {
  /**
   * If this is set to true, then `event.preventDefault()`
   * will be called on every keyboard event that goes through this Component.
   */
  preventDefault?: undefined | boolean;
} = {}) {
  useType(Keyboard);

  const pressed: Set<string> = new Set();

  const sharedListeners =
    useRootEntity().getComponent(StorageForKeyboard) ||
    useNewRootComponent(StorageForKeyboard);

  const handleKeyboardEvent: KeyboardEventHandler = (type, event) => {
    if (preventDefault) {
      event.preventDefault();
    }

    if (event.repeat) {
      return;
    }

    if (type === "keydown") {
      pressed.add(event.key);
    } else {
      pressed.delete(event.key);
    }
  };

  const { onEnabled, onDisabled } = useEnableDisable();

  onEnabled(() => {
    sharedListeners.addHandler(handleKeyboardEvent);
  });

  onDisabled(() => {
    sharedListeners.removeHandler(handleKeyboardEvent);
  });

  return {
    /**
     * A Set containing the names of all the keys
     * that are currently pressed.
     *
     * For a list of which Strings will be used, check [This page on MDN](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values),
     * or press some keys and look at the values present
     * in this Set using Hex Engine's inspector.
     */
    pressed,

    /**
     * A helper function that creates a `Vector` pointing in the direction indicated by
     * the combined state of the four specified direction keys. This is mainly useful
     * in that it allows you to treat Gamepad and Keyboard inputs the same.
     *
     * @param upKey The key that represents "up", eg "w".
     * @param downKey The key that represents "down", eg "s".
     * @param leftKey The key that represents "left", eg "a".
     * @param rightKey The key that represents "right", eg "d".
     */
    vectorFromKeys(
      upKey: string,
      downKey: string,
      leftKey: string,
      rightKey: string
    ): Vector {
      // TODO: revise this API so that you can re-use existing Vector instances,
      // instead of making a new one (potentially) every frame.

      const pressedKeys = pressed;

      let x = 0;
      let y = 0;
      if (pressedKeys.has(leftKey) || pressedKeys.has(leftKey.toUpperCase())) {
        x -= 1;
      }
      if (
        pressedKeys.has(rightKey) ||
        pressedKeys.has(rightKey.toUpperCase())
      ) {
        x += 1;
      }
      if (pressedKeys.has(upKey) || pressedKeys.has(upKey.toUpperCase())) {
        y -= 1;
      }
      if (pressedKeys.has(downKey) || pressedKeys.has(downKey.toUpperCase())) {
        y += 1;
      }

      return new Vector(x, y);
    },
  };
}
