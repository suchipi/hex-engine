import {
  useNewComponent,
  useType,
  RunLoop,
  useCallbackAsCurrent,
} from "@hex-engine/core";
import Inspector from "@hex-engine/inspector";
import { DrawChildren, useRawDraw } from "./DrawChildren";
import DrawOrder, {
  useDebugOverlayDrawTime,
  useCanvasDrawOrderSort,
} from "./DrawOrder";
import polyfillContext from "./polyfillContext";
import useCanvasSize from "../Hooks/useCanvasSize";
import useWindowSize from "../Hooks/useWindowSize";
import { setContext } from "../Hooks/useContext";

/** The built-in Canvas component that should be placed on your root Entity in order to render everything in your game. */
export default Object.assign(
  function Canvas(options: {
    /** You can specify an existing Canvas element to render into, if desired. If you do not, one will be created. */
    element?: HTMLCanvasElement;

    /** The background color to set the canvas to prior to drawing each frame. */
    backgroundColor: string;
  }) {
    useType(Canvas);

    const backgroundColor = options.backgroundColor;

    let canvas: HTMLCanvasElement;
    if (options.element) {
      canvas = options.element;
    } else {
      canvas = document.createElement("canvas");
      document.body.appendChild(canvas);
      canvas.style.userSelect = "none";
      // @ts-ignore this property was removed in TypeScript 3.9
      canvas.style.msUserSelect = "none";
      canvas.style.webkitUserSelect = "none";
    }
    canvas.className = canvas.className + " " + "hex-engine";
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());

    const context = canvas.getContext("2d");
    if (context == null) {
      throw new Error("2d drawing context type not supported by browser");
    }
    polyfillContext(context);

    setContext(context);

    useNewComponent(RunLoop);
    useNewComponent(() =>
      DrawChildren({
        backgroundColor,
      })
    );
    if (process.env.NODE_ENV !== "production") {
      useNewComponent(() => Inspector());
    }

    let preDraw: (context: CanvasRenderingContext2D) => void = () => {};

    useRawDraw((context) => {
      preDraw(context);
    });

    function setPixelated(on: boolean) {
      if (on) {
        canvas.style.imageRendering = navigator.userAgent.match(/firefox/i)
          ? "-moz-crisp-edges"
          : "pixelated";

        preDraw = (context) => {
          [
            "imageSmoothingEnabled",
            "mozImageSmoothingEnabled",
            "oImageSmoothingEnabled",
            "webkitImageSmoothingEnabled",
            "msImageSmoothingEnabled",
          ].forEach((property) => {
            // @ts-ignore
            context[property] = false;
          });
        };
      } else {
        canvas.style.imageRendering = "";

        preDraw = (context) => {
          [
            "imageSmoothingEnabled",
            "mozImageSmoothingEnabled",
            "oImageSmoothingEnabled",
            "webkitImageSmoothingEnabled",
            "msImageSmoothingEnabled",
          ].forEach((property) => {
            // @ts-ignore
            context[property] = true;
          });
        };
      }
    }

    setPixelated(true);

    const { resizeCanvas } = useCanvasSize();

    return {
      element: canvas,
      context,

      setPixelated,

      resize: resizeCanvas,

      fullscreen: useCallbackAsCurrent(
        ({ pixelZoom = 1 }: { pixelZoom?: number } = {}) => {
          const { windowSize, onWindowResize } = useWindowSize();

          const doc = canvas.ownerDocument;
          if (doc) {
            Object.assign(doc.body.style, {
              margin: 0,
              padding: 0,
              overflow: "hidden",
            });
          }

          const matchWindowSize = () => {
            resizeCanvas({
              realWidth: windowSize.x,
              realHeight: windowSize.y,
              pixelWidth: windowSize.x / pixelZoom,
              pixelHeight: windowSize.y / pixelZoom,
            });
          };

          onWindowResize(matchWindowSize);
          matchWindowSize();
        }
      ),
    };
  },
  {
    DrawOrder,
  }
);

export { useRawDraw, useDebugOverlayDrawTime, useCanvasDrawOrderSort };
