import { useType, useNewComponent, useRootEntity } from "@hex-engine/core";
import LowLevelMouse, { useFirstClick } from "./LowLevelMouse";
import Keyboard, { useFirstKey } from "./Keyboard";

/**
 * A Component to be placed on the root Entity, which creates a Web Audio API
 * `AudioContext` upon first user interaction with the page.
 *
 * Web browsers disallow playback of audio prior to user interaction, which is
 * why this Component waits until the first click or keypress to come from the user
 * before creating an AudioContext.
 */
export default function AudioContextComponent() {
  useType(AudioContextComponent);
  useNewComponent(LowLevelMouse);
  useNewComponent(Keyboard);

  let audioContext: null | AudioContext;

  useFirstClick(() => {
    if (!audioContext) {
      audioContext = new AudioContext();
    }
  });
  useFirstKey(() => {
    if (!audioContext) {
      audioContext = new AudioContext();
    }
  });

  return {
    get audioContext() {
      return audioContext;
    },
  };
}

/** Retrieve the current AudioContext from the root Entity's `AudioContext` component, if any. */
export function useAudioContext() {
  const audioContext = useRootEntity().getComponent(AudioContextComponent)
    ?.audioContext;

  return audioContext || null;
}
