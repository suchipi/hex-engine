/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import AudioComponent from "./Audio";
import Preloader from "../Preloader";
import { endGame, startGame } from "./inputTestSetup";

afterEach(endGame);

let clipCount = 0;

/**
 * Builds a tiny silent WAV as a data url. Generated rather than checked in so
 * that every test gets a url nothing else can have loaded, and so that the
 * fixture's contents are visible right here.
 */
function silentWavUrl(): string {
  clipCount++;
  const sampleRate = 8000;
  const sampleCount = sampleRate / 100 + clipCount;
  const dataBytes = sampleCount * 2;

  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);

  const writeText = (offset: number, text: string) => {
    for (let index = 0; index < text.length; index++) {
      view.setUint8(offset + index, text.charCodeAt(index));
    }
  };

  writeText(0, "RIFF");
  view.setUint32(4, 36 + dataBytes, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true); // PCM header size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeText(36, "data");
  view.setUint32(40, dataBytes, true);

  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < bytes.length; index++) {
    binary += String.fromCharCode(bytes[index]);
  }

  return `data:audio/wav;base64,${btoa(binary)}`;
}

function startWithAudio(url: string): ReturnType<typeof AudioComponent> {
  let audio!: ReturnType<typeof AudioComponent>;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);
      audio = useNewComponent(() => AudioComponent({ url }));
    });
  });

  return audio;
}

test("an Audio knows the url it was made from", () => {
  const url = silentWavUrl();

  expect(startWithAudio(url).url).toBe(url);
});

test("an Audio loads on its own, and reports the loaded element", async () => {
  const audio = startWithAudio(silentWavUrl());

  expect(audio.loaded).toBe(false);
  expect(audio.data).toBe(null);

  await audio.load();

  expect(audio.loaded).toBe(true);
  expect(audio.data).toBeInstanceOf(HTMLAudioElement);
});

test("loading is registered with the Preloader, so Preloader.load waits for it", async () => {
  const audio = startWithAudio(silentWavUrl());

  await Preloader.load();

  expect(audio.loaded).toBe(true);
});

test("load resolves straight away once the clip is already loaded", async () => {
  const audio = startWithAudio(silentWavUrl());
  await audio.load();

  let settled = false;
  await audio.load().then(() => {
    settled = true;
  });

  expect(settled).toBe(true);
});

test("loading a url that is not audio rejects", async () => {
  const audio = startWithAudio("data:audio/wav;base64,bm90YXVkaW8=");

  let error: Error | null = null;
  await audio.load().catch((caught) => {
    error = caught;
  });

  expect((error as unknown as Error).message).toBe("Failed to load audio");
  expect(audio.loaded).toBe(false);
});

test("playing before the clip has loaded does nothing, and does not reject", async () => {
  const audio = startWithAudio(silentWavUrl());

  expect(audio.loaded).toBe(false);

  let rejected = false;
  await audio.play().catch(() => {
    rejected = true;
  });

  expect(rejected).toBe(false);
});

test("playing a loaded clip starts it", async () => {
  const audio = startWithAudio(silentWavUrl());
  await audio.load();

  await audio.play();

  expect(audio.data!.paused).toBe(false);
});

test("the volume option is applied to the underlying element", async () => {
  const audio = startWithAudio(silentWavUrl());
  await audio.load();

  await audio.play({ volume: 0.25 });

  expect(audio.data!.volume).toBe(0.25);
});

test("playing without a volume leaves the volume where it was", async () => {
  const audio = startWithAudio(silentWavUrl());
  await audio.load();

  await audio.play({ volume: 0.5 });
  await audio.play();

  expect(audio.data!.volume).toBe(0.5);
});

test("an Audio made after that url has loaded reuses the cached one", async () => {
  const url = silentWavUrl();

  const first = startWithAudio(url);
  await first.load();

  endGame();
  const second = startWithAudio(url);

  expect(second.data).toBe(first.data);
  expect(second.loaded).toBe(true);
});

test("Audios made for one url before it finishes loading share that one load", async () => {
  const url = silentWavUrl();
  let first!: ReturnType<typeof AudioComponent>;
  let second!: ReturnType<typeof AudioComponent>;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);
      first = useNewComponent(() => AudioComponent({ url }));
      second = useNewComponent(() => AudioComponent({ url }));
    });
  });

  await first.load();
  await second.load();

  expect(first.data).toBe(second.data);
});

test("a url that failed to load can be tried again", async () => {
  const url = "data:audio/wav;base64,bm90YXVkaW8=";

  const first = startWithAudio(url);
  await first.load().catch(() => {});
  expect(first.loaded).toBe(false);

  endGame();

  // The failure is not cached, so this is a fresh attempt rather than the
  // broken one handed back again.
  const second = startWithAudio(url);
  expect(second.loaded).toBe(false);
  await second.load().catch(() => {});
});
