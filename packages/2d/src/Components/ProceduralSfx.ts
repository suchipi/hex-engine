import { useType } from "@hex-engine/core";
import { useUpdate } from "../Hooks";
import { useAudioContext } from "./AudioContext";
import { makeModalSynthesis } from "modal-synthesis";

type Synthesis = ReturnType<typeof makeModalSynthesis>;

/**
 * A Component that can be used to generate procedural sound effects,
 * by synthesizing modal sounds. A modal sound is a resonating, ringing
 * sound that is composed out of several different sine waves, such as
 * the sound that is emitted when you strike a wine glass or metal rod.
 *
 * If you use a spectrogram to identify the frequency, amplitude, and decay rate
 * of the sine waves that the sound is made out of, then you can provide them
 * to this function, and it will create a model that synthesizes that sound.
 *
 * If you then vary the frequency, amplitude, or decay rate slightly each time
 * the sound is played, you can get a rich bank of sound effects all from one sound.
 */
export default function ProceduralSfx(
  modes: Array<{
    frequency: number;
    amplitude: number;
    decay: number;
  }>
) {
  useType(ProceduralSfx);

  let synthesis: null | Synthesis = null;

  useUpdate(() => {
    if (!synthesis) {
      const audioContext = useAudioContext();
      if (!audioContext) return; // Can't play audio until first user interaction with the page

      synthesis = makeModalSynthesis(modes, audioContext);
    }
  });

  let hasWarned = false;
  return {
    /**
     * Returns the synthesis model, if it is available.
     *
     * To work around browsers disallowing sound to be played without the user interacting with
     * the page first, the synthesis model will not be created until the first time the user
     * clicks on the page, or presses a key. Until then, this will be `null`.
     */
    get synthesis() {
      return synthesis;
    },

    /**
     * Synthesize a sound effect. You can optionally include
     * `amplitudeMultiplier`, `frequencyMultiplier`, or `decayMultiplier`
     * values to vary the waves, which may be desirable to, for example,
     * vary the loudness based on the speed of two colliding objects.
     *
     * Even if you do not have any variables like speed to connect to
     * your sounds, it is recommended that you vary the waves slightly each
     * time the sound is played, to give the sound some variety.
     */
    play(options?: {
      amplitudeMultiplier?:
        | number
        | ((modeIndex: number) => number)
        | undefined;
      frequencyMultiplier?:
        | number
        | ((modeIndex: number) => number)
        | undefined;
      decayMultiplier?: number | ((modeIndex: number) => number) | undefined;
      whiteNoiseDuration?: number | undefined;
    }) {
      if (!synthesis) {
        if (!hasWarned) {
          console.warn(
            "Tried to play a sound from ProceduralSfx, but the synthesis wasn't ready yet. " +
              "This usually means that the user hasn't interacted with the page yet, " +
              "so the webpage isn't allowed to play audio yet, but it *could* mean that " +
              "there is no AudioContext component on your root entity. If you have clicked on the page " +
              "and still don't hear audio, please check to ensure there is an AudioContext component " +
              "on the root entity. "
          );
          hasWarned = true;
        }
        return;
      }

      const audioContext = useAudioContext();
      if (!audioContext) return; // Can't play audio until first user interaction with the page

      const model = synthesis.makeModel({
        ...options,
        autoDisconnect: true,
      });
      model.outputNode.connect(audioContext.destination);
      model.excite(options?.whiteNoiseDuration ?? 10);
    },
  };
}
