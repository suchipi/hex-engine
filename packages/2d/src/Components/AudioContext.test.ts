/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import AudioContextComponent, { useAudioContext } from "./AudioContext";
import Keyboard from "./Keyboard";
import LowLevelMouse from "./LowLevelMouse";
import { useUpdate } from "../Hooks";
import { endGame, keyDown, mouseDown, startGame, step } from "./inputTestSetup";

// The AudioContext is created on the first click or keypress, and both of those
// are latched for the life of the page. Test order is not fixed, so everything
// that depends on the "before any interaction" state has to live in one test.
test("an AudioContext appears on the first click, and is reachable from anywhere in the tree", () => {
  let component!: ReturnType<typeof AudioContextComponent>;
  let fromDeepInTheTree: null | AudioContext = null;

  const root = startGame(() => {
    component = useNewComponent(AudioContextComponent);

    useChild(function Deep() {
      useType(Deep);
      useChild(function Deeper() {
        useType(Deeper);

        useNewComponent(function Reader() {
          useType(Reader);
          // useAudioContext is a hook, so it has to be read from inside the
          // Component rather than from the test body.
          useUpdate(() => {
            fromDeepInTheTree = useAudioContext();
          });
        });
      });
    });
  });

  expect(root.hasComponent(LowLevelMouse)).toBe(true);
  expect(root.hasComponent(Keyboard)).toBe(true);

  // Nothing until the user has interacted with the page.
  expect(component.audioContext).toBe(null);
  step();
  expect(fromDeepInTheTree).toBe(null);

  mouseDown(10, 10);

  expect(component.audioContext).toBeInstanceOf(AudioContext);
  step();
  expect(fromDeepInTheTree).toBe(component.audioContext);

  // A later keypress does not replace the one that is already there.
  const created = component.audioContext;
  keyDown("a");
  expect(component.audioContext).toBe(created);

  endGame();
});

test("useAudioContext gives null when the root has no AudioContext Component", () => {
  let seen: null | AudioContext = null;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);
      useNewComponent(function Reader() {
        useType(Reader);
        useUpdate(() => {
          seen = useAudioContext();
        });
      });
    });
  });

  step();

  expect(seen).toBe(null);

  endGame();
});
