/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import AudioContextComponent from "./AudioContext";
import ProceduralSfx from "./ProceduralSfx";
import { useUpdate } from "../Hooks";
import { endGame, startGame, step } from "./inputTestSetup";

// The first click is latched for the life of the page, so the "user has not
// interacted yet" state can only be observed in a file that never clicks. Test
// order within a file is not fixed, which is why this is a file of its own.
test("nothing is synthesized, and playing warns, until the page has been interacted with", () => {
  const warnings: Array<unknown> = [];
  const realWarn = console.warn;
  console.warn = (...args: Array<unknown>) => {
    warnings.push(args[0]);
  };

  try {
    let sfx!: ReturnType<typeof ProceduralSfx>;
    let shouldPlay = false;

    startGame(() => {
      useNewComponent(AudioContextComponent);

      useChild(function Subject() {
        useType(Subject);
        sfx = useNewComponent(() =>
          ProceduralSfx([{ frequency: 440, amplitude: 1, decay: 2 }])
        );

        useUpdate(() => {
          if (shouldPlay) sfx.play();
        });
      });
    });

    step();
    step();
    expect(sfx.synthesis).toBe(null);

    shouldPlay = true;
    step();

    expect(warnings.length).toBe(1);
    expect(String(warnings[0])).toContain("wasn't ready yet");
  } finally {
    console.warn = realWarn;
    endGame();
  }
});
