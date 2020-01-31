import {
  useNewComponent,
  useType,
  RunLoop,
  useCallbackAsCurrent,
} from "@hex-engine/core";
import Inspector from "@hex-engine/inspector";
import { UpdateChildren, useUpdate } from "./UpdateChildren";
import { DrawChildren, useRawDraw } from "./DrawChildren";
import DrawOrder, {
  useDebugOverlayDrawTime,
  useCanvasDrawOrderSort,
} from "./DrawOrder";
import polyfillContext from "./polyfillContext";
import useCanvasSize from "../Hooks/useCanvasSize";
import useWindowSize from "../Hooks/useWindowSize";

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
      canvas.style.msUserSelect = "none";
      canvas.style.webkitUserSelect = "none";
    }
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());

    const context = canvas.getContext("2d");
    if (context == null) {
      throw new Error("2d drawing context type not supported by browser");
    }
    polyfillContext(context);

    const backstageCanvas = document.createElement("canvas");
    backstageCanvas.width = canvas.width;
    backstageCanvas.height = canvas.height;

    const backstageContext = backstageCanvas.getContext("2d");
    if (backstageContext == null) {
      throw new Error("2d drawing context type not supported by browser");
    }
    polyfillContext(backstageContext);

    useNewComponent(RunLoop);
    useNewComponent(() =>
      DrawChildren({
        context,
        backstage: backstageContext,
        backgroundColor,
      })
    );
    useNewComponent(UpdateChildren);
    if (process.env.NODE_ENV !== "production") {
      useNewComponent(() => Inspector());
    }

    function setPixelated(on: boolean) {
      if (on) {
        canvas.style.imageRendering = navigator.userAgent.match(/firefox/i)
          ? "-moz-crisp-edges"
          : "pixelated";

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
      } else {
        canvas.style.imageRendering = "";

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
      }
    }

    setPixelated(true);

    let canvasSizeHookResult: null | ReturnType<typeof useCanvasSize> = null;
    let windowSizeHookResult: null | ReturnType<typeof useWindowSize> = null;

    const resize = useCallbackAsCurrent(
      ({
        realWidth,
        realHeight,
        pixelWidth,
        pixelHeight,
      }: {
        realWidth: number | string;
        realHeight: number | string;
        pixelWidth: number;
        pixelHeight: number;
      }) => {
        if (!canvasSizeHookResult) {
          canvasSizeHookResult = useCanvasSize();
        }

        canvasSizeHookResult.resizeCanvas({
          realWidth,
          realHeight,
          pixelWidth,
          pixelHeight,
        });
      }
    );

    return {
      element: canvas,
      context,
      backstage: backstageContext,

      setPixelated,

      resize,

      fullscreen: useCallbackAsCurrent(
        ({ pixelZoom = 1 }: { pixelZoom?: number } = {}) => {
          if (!windowSizeHookResult) {
            windowSizeHookResult = useWindowSize();
          }
          const { windowSize, onWindowResize } = windowSizeHookResult;

          Object.assign(document.body.style, {
            margin: 0,
            padding: 0,
            overflow: "hidden",
          });

          const matchWindowSize = () => {
            resize({
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

export {
  useUpdate,
  useRawDraw,
  useDebugOverlayDrawTime,
  useCanvasDrawOrderSort,
};
