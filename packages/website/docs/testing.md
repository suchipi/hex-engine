---
title: Testing
---

As of 0.4.0, Hex Engine includes the [Test-It](https://github.com/suchipi/test-it) test runner. You can use this for unit tests, visual regression testing, debugging, and more.

To add tests to your codebase, create files whose filenames end with `.test.ts`, `.test.tsx`, `.test.js`, or `.test.jsx`. Those files will be run by [Test-It](https://github.com/suchipi/test-it) when you run `npm test`.

> Note: If your codebase was created with a version of Hex Engine prior to 0.4.0, then there won't be a `test` script in your `package.json`, so `npm test` won't work. To fix it, create a new project by following the instructions in [First Time Setup](/docs/first-time-setup), then copy your game files from your existing codebase into the new project.

You can run your tests in watch mode by passing the `--watch` flag, ie `npm test -- --watch`.

You can update any snapshots created by `expect(value).toMatchSnapshot()` or `expect(buffer).toMatchImageSnapshot()` by passing the `-u` flag, ie `npm test -- -u`.

## Example Tests

Below are some examples of tests you could add to your codebase. Each is explained, and has a comment on the first line indicating an appropriate filename for the test file where the code should appear.

### Whole App VRT

This example test starts the game, advances it 100 frames, and then takes a screenshot of the page. The first time the test is run, the screenshot will be taken and saved to disk. On subsequent runs, the screenshot will be taken and compared to the screenshot on disk, and the test will fail if the screenshot differs.

This test assumes your root component is accessible via `./Root`.

```ts
// frame101.test.ts
import { createRoot, RunLoop } from "@hex-engine/2d";
import Root from "./Root";

test("frame 101 renders as expected", async () => {
  const rootEnt = createRoot(Root);
  const runLoop = rootEnt.getComponent(RunLoop)!;
  runLoop.pause(); // This is the same as hitting the pause button in the Hex Engine inspector.

  for (let i = 0; i < 100; i++) {
    runLoop.step(); // This advances to the next frame; it's the same as hitting the step button in the Hex Engine inspector.
  }

  expect(await TestIt.captureScreenshot()).toMatchImageSnapshot();
});
```

If your tests will be run across different operating systems, then the font for the inspector may render differently. As such, you may wish to hide the inspector UI prior to taking your screenshot. You can do that as follows:

```ts {3,15,16}
// frame101.test.ts
import { createRoot, RunLoop } from "@hex-engine/2d";
import { Inspector } from "@hex-engine/inspector"; // Add inspector import
import Root from "./Root";

test("frame 101 renders as expected", async () => {
  const rootEnt = createRoot(Root);
  const runLoop = rootEnt.getComponent(RunLoop)!;
  runLoop.pause();

  for (let i = 0; i < 100; i++) {
    runLoop.step();
  }

  const inspector = rootEnt.getComponent(Inspector)!;
  inspector.hide(); // Hide the inspector UI

  expect(await TestIt.captureScreenshot()).toMatchImageSnapshot();
});
```

### Unit Test

This example test creates an empty canvas and tests a single component in isolation. It sets up a root entity with a canvas and the component under test, and then takes a screenshot of the page. The first time the test is run, the screenshot will be taken and saved to disk. On subsequent runs, the screenshot will be taken and compared to the screenshot on disk, and the test will fail if the screenshot differs.

This test assumes that the component you want to test is accessible via `./MyComponent`.

```ts
// MyComponent.test.ts
import { createRoot, useNewComponent, Canvas, RunLoop } from "@hex-engine/2d";
import { Inspector } from "@hex-engine/inspector";
import MyComponent from "./MyComponent";

test("MyComponent renders as expected", async () => {
  const rootEnt = createRoot(() => {
    useNewComponent(() => Canvas({ backgroundColor: "white" }));
    useNewComponent(() => MyComponent());
  });

  const runLoop = rootEnt.getComponent(RunLoop)!;
  runLoop.pause();

  const inspector = rootEnt.getComponent(Inspector)!;
  inspector.hide();

  expect(await TestIt.captureScreenshot()).toMatchImageSnapshot();
});
```

## Debugging Tests

To debug a test using Chrome DevTools, instead of using `test` or `it` when declaring your test, use `debug`. For example, to debug the ["Whole App VRT"](#whole-app-vrt) example test, you would modify line 5 as highlighted here:

<!-- prettier-ignore -->
```ts {5}
// frame101.test.ts
import { createRoot, RunLoop } from "@hex-engine/2d";
import Root from "./Root";

debug("frame 101 renders as expected", async () => { // test changed to debug
  const rootEnt = createRoot(Root);
  const runLoop = rootEnt.getComponent(RunLoop)!;
  runLoop.pause();

  for (let i = 0; i < 100; i++) {
    runLoop.step();
  }

  expect(await TestIt.captureScreenshot()).toMatchImageSnapshot();
});
```

With this change in place, when you run your tests, two windows will open up: A browser window showing the contents of the page, and a Chrome DevTools window. You can use the Chrome DevTools to debug the test.

## Running Tests on a Continuous Integration (CI) Server/Platform

[Test-It](https://github.com/suchipi/test-it), the test runner that Hex Engine uses, cannot run tests in headless mode. Instead, it runs them using a hidden Chromium window. Due to this, your tests may not work out-of-the-box on a CI server/platform such as Jenkins, Travis, or GitHub Actions. One way to make them work is to run them in a docker container that has all the necessary dependencies set up for running browser tests with Chrome. Here is an example Dockerfile that you can use to build an image for such a container.

```Dockerfile
FROM node:current

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update
RUN apt-get -y install locales

RUN locale-gen en_US.UTF-8
RUN update-locale LANG=en_US.UTF-8
ENV LANG en_US.UTF-8

RUN apt-get install -y libglib2.0
RUN apt-get install -y libnss3
RUN apt-get install -y xvfb
RUN apt-get install -y libxcomposite1
RUN apt-get install -y libxcursor1
RUN apt-get install -y libxi6
RUN apt-get install -y libxtst6
RUN apt-get install -y libcups2
RUN apt-get install -y libxss1
RUN apt-get install -y libxrandr2
RUN apt-get install -y libasound2
RUN apt-get install -y libatk1.0
RUN apt-get install -y libpangocairo-1.0
RUN apt-get install -y libatspi2.0
RUN apt-get install -y libgtk-3-0

ENV DISPLAY :0
CMD Xvfb -screen 0 1024x768x16 -ac & cd /app && npm test
```
