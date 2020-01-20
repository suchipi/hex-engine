import { useType, useNewComponent, useRootEntity } from "@hex-engine/core";
import LowLevelMouse, { useFirstClick } from "./LowLevelMouse";
import Keyboard, { useFirstKey } from "./Keyboard";

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

export function useAudioContext() {
  const audioContext = useRootEntity().getComponent(AudioContextComponent)
    ?.audioContext;

  return audioContext || null;
}
