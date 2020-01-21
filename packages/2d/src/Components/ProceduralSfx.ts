import { useType } from "@hex-engine/core";
import { useUpdate } from "../Hooks";
import { useAudioContext } from "./AudioContext";
import { makeModalSynthesis } from "modal-synthesis";

type Synthesis = ReturnType<typeof makeModalSynthesis>;
type ModelOptions = Parameters<Synthesis["makeModel"]>[0];

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
    get synthesis() {
      return synthesis;
    },
    play(
      options?: Exclude<ModelOptions, { autoDisconnect: boolean }> & {
        whiteNoiseDuration?: number | undefined;
      }
    ) {
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
