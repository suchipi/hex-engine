/// <reference types="@test-it/core/globals" />
import { useChild, useNewComponent, useType } from "@hex-engine/core";
import ImageComponent from "./Image";
import Preloader from "../Preloader";
import { endGame, startGame } from "./inputTestSetup";
import tilesetUrl from "../__fixtures__/tileset.png";
import playerUrl from "../__fixtures__/player.png";

const TILESET_WIDTH = 32;
const TILESET_HEIGHT = 8;

afterEach(endGame);

function startWithImage(url: string): ReturnType<typeof ImageComponent> {
  let image!: ReturnType<typeof ImageComponent>;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);
      image = useNewComponent(() => ImageComponent({ url }));
    });
  });

  return image;
}

function blankContext(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext("2d")!;
}

let unusedUrlCount = 0;

/**
 * A valid image url that no earlier test can have loaded already, since Image
 * keeps a module-level cache keyed by url and test order is not fixed.
 */
function unloadedImageUrl(): string {
  unusedUrlCount++;
  const context = blankContext(64, 4);
  context.fillStyle = "red";
  // A different number of pixels each call, so every url is distinct.
  context.fillRect(0, 0, unusedUrlCount, 1);
  return context.canvas.toDataURL();
}

function pixels(context: CanvasRenderingContext2D) {
  return Array.from(
    context.getImageData(0, 0, context.canvas.width, context.canvas.height).data
  );
}

test("importing an image gives back a URL", () => {
  expect(typeof tilesetUrl).toBe("string");
  expect(tilesetUrl.length).toBeGreaterThan(0);
});

test("an Image knows the url it was made from", () => {
  expect(startWithImage(tilesetUrl).url).toBe(tilesetUrl);
});

test("an Image loads on its own, and reports the loaded element", async () => {
  const image = startWithImage(tilesetUrl);

  await image.load();

  expect(image.loaded).toBe(true);
  expect(image.data).toBeInstanceOf(HTMLImageElement);
  expect(image.data!.width).toBe(TILESET_WIDTH);
  expect(image.data!.height).toBe(TILESET_HEIGHT);
});

test("loading is registered with the Preloader, so Preloader.load waits for it", async () => {
  const image = startWithImage(playerUrl);

  await Preloader.load();

  expect(image.loaded).toBe(true);
});

test("load resolves straight away once the image is already loaded", async () => {
  const image = startWithImage(tilesetUrl);
  await image.load();

  let settled = false;
  await image.load().then(() => {
    settled = true;
  });

  expect(settled).toBe(true);
});

test("an Image made after that url has loaded reuses the cached one", async () => {
  const url = unloadedImageUrl();

  const first = startWithImage(url);
  await first.load();

  const second = startWithImage(url);

  expect(second.data).toBe(first.data);
  expect(second.loaded).toBe(true);
});

test("Images made for one url before it finishes loading share that one load", async () => {
  const url = unloadedImageUrl();
  let first!: ReturnType<typeof ImageComponent>;
  let second!: ReturnType<typeof ImageComponent>;

  startGame(() => {
    useChild(function Subject() {
      useType(Subject);
      first = useNewComponent(() => ImageComponent({ url }));
      second = useNewComponent(() => ImageComponent({ url }));
    });
  });

  await first.load();
  await second.load();

  expect(first.data).toBe(second.data);
});

test("a url that failed to load can be tried again", async () => {
  const url = "data:image/png;base64,bm90YW5pbWFnZQ==";

  const first = startWithImage(url);
  await first.load().catch(() => {});
  expect(first.loaded).toBe(false);

  endGame();

  // The failure is not cached, so this is a fresh attempt rather than the
  // broken one handed back again.
  const second = startWithImage(url);
  expect(second.loaded).toBe(false);
  await second.load().catch(() => {});
});

test("loading a url that is not an image rejects", async () => {
  const image = startWithImage("data:image/png;base64,bm90YW5pbWFnZQ==");

  let error: Error | null = null;
  await image.load().catch((caught) => {
    error = caught;
  });

  expect((error as unknown as Error).message).toBe("Failed to load image");
  expect(image.loaded).toBe(false);
});

test("drawing before the image has loaded does nothing", () => {
  const image = startWithImage(unloadedImageUrl());
  const context = blankContext(TILESET_WIDTH, TILESET_HEIGHT);
  const before = pixels(context);

  expect(image.loaded).toBe(false);
  image.draw(context, { x: 0, y: 0 });

  expect(pixels(context)).toEqual(before);
});

test("drawing a loaded image puts it on the canvas at its natural size", async () => {
  const image = startWithImage(tilesetUrl);
  await image.load();

  const drawn = blankContext(TILESET_WIDTH, TILESET_HEIGHT);
  image.draw(drawn, { x: 0, y: 0 });

  const expected = blankContext(TILESET_WIDTH, TILESET_HEIGHT);
  expected.drawImage(image.data!, 0, 0);

  expect(pixels(drawn)).toEqual(pixels(expected));
});

test("draw honours the source rectangle and the target size", async () => {
  const image = startWithImage(tilesetUrl);
  await image.load();

  const drawn = blankContext(16, 16);
  image.draw(drawn, {
    x: 0,
    y: 0,
    sourceX: 8,
    sourceY: 0,
    sourceWidth: 8,
    sourceHeight: 8,
    targetWidth: 16,
    targetHeight: 16,
  });

  const expected = blankContext(16, 16);
  expected.drawImage(image.data!, 8, 0, 8, 8, 0, 0, 16, 16);

  expect(pixels(drawn)).toEqual(pixels(expected));
});

test("draw does nothing when any of the sizes is zero", async () => {
  const image = startWithImage(tilesetUrl);
  await image.load();

  const context = blankContext(TILESET_WIDTH, TILESET_HEIGHT);
  const before = pixels(context);

  image.draw(context, { x: 0, y: 0, sourceWidth: 0 });
  image.draw(context, { x: 0, y: 0, sourceHeight: 0 });
  image.draw(context, { x: 0, y: 0, targetWidth: 0 });
  image.draw(context, { x: 0, y: 0, targetHeight: 0 });

  expect(pixels(context)).toEqual(before);
});

test("asPattern falls back to a plain style until the image has loaded", () => {
  const image = startWithImage(unloadedImageUrl());
  const context = blankContext(10, 10);

  expect(image.loaded).toBe(false);
  expect(image.asPattern(context)).toBe("magenta");
  expect(image.asPattern(context, "repeat", "cyan")).toBe("cyan");
});

test("asPattern gives a real pattern once loaded, and reuses it per context", async () => {
  const image = startWithImage(tilesetUrl);
  await image.load();

  const context = blankContext(10, 10);
  const pattern = image.asPattern(context);

  expect(pattern).toBeInstanceOf(CanvasPattern);
  expect(image.asPattern(context)).toBe(pattern);
  expect(image.asPattern(context, "no-repeat")).not.toBe(pattern);
});
